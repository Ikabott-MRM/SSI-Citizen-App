import { Buffer } from 'buffer';
import nacl from 'tweetnacl';
import axios from 'axios';
import { getPublicEnv } from '@/utils/publicEnv';

// Dedicated client for DID auth endpoints to avoid a circular import with
// services/axios.ts (which attaches Bearer + 401 re-auth via didSession).
const DEFAULT_PUBLIC_API_BASE_URL = 'https://api.ssi-api.xyz';

function normalizeBaseUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  return url.replace(/\/+$/, '');
}

const authClient = axios.create({
  baseURL: DEFAULT_PUBLIC_API_BASE_URL,
});

function prepareAuthClient(): void {
  const base =
    normalizeBaseUrl(getPublicEnv('EXPO_PUBLIC_API_BASE_URL')) ??
    DEFAULT_PUBLIC_API_BASE_URL;
  authClient.defaults.baseURL = base;
  const key = getPublicEnv('EXPO_PUBLIC_API_KEY');
  if (key) {
    authClient.defaults.headers.common['x-api-key'] = key;
    authClient.defaults.headers.common['api_key'] = key;
  } else {
    delete authClient.defaults.headers.common['x-api-key'];
    delete authClient.defaults.headers.common['api_key'];
    // eslint-disable-next-line no-console
    console.warn('[DID auth] EXPO_PUBLIC_API_KEY missing at request time');
  }
}

export type DidAuthChallenge = {
  challengeId: string;
  nonce: string;
  expiresAt: string;
  message: string;
};

export type DidAuthToken = {
  accessToken: string;
  expiresIn: number;
};

type PortableDidPrivateKeyJwk = {
  kty?: string;
  crv?: string;
  d?: string;
  x?: string;
  kid?: string;
  alg?: string;
};

type PortableDidJson = {
  uri?: string;
  document?: {
    authentication?: Array<string | { id?: string }>;
    assertionMethod?: Array<string | { id?: string }>;
    verificationMethod?: Array<{ id?: string; publicKeyJwk?: PortableDidPrivateKeyJwk }>;
  };
  privateKeys?: PortableDidPrivateKeyJwk[];
};

function unwrapPayload<T extends Record<string, unknown>>(body: unknown): T {
  if (!body || typeof body !== 'object') {
    throw new Error('Unexpected DID auth response shape');
  }
  const obj = body as Record<string, unknown>;
  if (obj.data && typeof obj.data === 'object') {
    return obj.data as T;
  }
  return obj as T;
}

/** base64url encode without padding */
export function bytesToBase64Url(bytes: Uint8Array): string {
  return Buffer.from(bytes)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

export function base64UrlToBytes(value: string): Uint8Array {
  const padded = value + '='.repeat((4 - (value.length % 4)) % 4);
  const b64 = padded.replace(/-/g, '+').replace(/_/g, '/');
  return new Uint8Array(Buffer.from(b64, 'base64'));
}

function fragmentId(ref: string | { id?: string } | undefined): string | null {
  if (!ref) return null;
  const id = typeof ref === 'string' ? ref : ref.id;
  if (!id) return null;
  const hash = id.indexOf('#');
  return hash >= 0 ? id.slice(hash + 1) : id;
}

/**
 * Pick the Ed25519 private JWK used for authentication (VM #0 / auth / assert).
 * portableDid is the JSON string stored in Keychain by DidProvider.
 */
export function selectSigningPrivateKeyJwk(
  portableDidJson: string,
): PortableDidPrivateKeyJwk {
  let parsed: PortableDidJson;
  try {
    parsed = JSON.parse(portableDidJson) as PortableDidJson;
  } catch {
    throw new Error('portableDid is not valid JSON');
  }

  const privateKeys = parsed.privateKeys;
  if (!Array.isArray(privateKeys) || privateKeys.length === 0) {
    throw new Error('portableDid has no privateKeys');
  }

  const preferredFragment =
    fragmentId(parsed.document?.authentication?.[0]) ??
    fragmentId(parsed.document?.assertionMethod?.[0]) ??
    '0';

  const byKid = privateKeys.find(k => {
    if (!k?.kid) return false;
    const kidFrag = fragmentId(k.kid) ?? k.kid;
    return kidFrag === preferredFragment || k.kid.endsWith(`#${preferredFragment}`);
  });

  const ed25519 =
    byKid ??
    privateKeys.find(k => k?.crv === 'Ed25519' && typeof k.d === 'string') ??
    privateKeys[0];

  if (!ed25519 || typeof ed25519.d !== 'string') {
    throw new Error('No Ed25519 private key (JWK.d) found in portableDid');
  }

  return ed25519;
}

/**
 * Sign the exact UTF-8 challenge `message` with Ed25519 detached signature.
 * Returns base64url(signature) as required by POST /auth/did/token.
 *
 * Uses tweetnacl over the 32-byte OKP seed from portableDid privateKeys[].d
 * (Web5 / TBD PortableDid JWK). @web5/dids is not a Citizen App dependency;
 * DID creation happens server-side and the full portableDid (incl. privateKeys)
 * is returned to the client.
 */
export function signDidAuthMessage(
  message: string,
  portableDidJson: string,
): string {
  const jwk = selectSigningPrivateKeyJwk(portableDidJson);
  const seed = base64UrlToBytes(jwk.d!);
  if (seed.length !== 32) {
    throw new Error(
      `Ed25519 JWK.d must be 32 bytes, got ${seed.length}. Cannot sign DID auth message.`,
    );
  }

  const keyPair = nacl.sign.keyPair.fromSeed(seed);
  const messageBytes = new TextEncoder().encode(message);
  const signature = nacl.sign.detached(messageBytes, keyPair.secretKey);
  return bytesToBase64Url(signature);
}

function didAuthHttpError(error: unknown): Error {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const host = authClient.defaults.baseURL ?? 'unknown-host';
    return new Error(`DID auth failed (${status ?? 'network'}) at ${host}`);
  }
  return error instanceof Error ? error : new Error('DID authentication failed');
}

export async function requestDidChallenge(did: string): Promise<DidAuthChallenge> {
  prepareAuthClient();
  const response = await authClient.post('/auth/did/challenge', { did });
  const payload = unwrapPayload<DidAuthChallenge>(response.data);
  if (!payload.challengeId || !payload.message) {
    throw new Error('DID challenge response missing challengeId/message');
  }
  return payload;
}

export async function requestDidToken(params: {
  did: string;
  challengeId: string;
  signature: string;
}): Promise<DidAuthToken> {
  prepareAuthClient();
  const response = await authClient.post('/auth/did/token', params);
  const payload = unwrapPayload<DidAuthToken>(response.data);
  if (!payload.accessToken) {
    throw new Error('DID token response missing accessToken');
  }
  return payload;
}

/**
 * Full proof-of-DID login: challenge → sign(message) → token.
 */
export async function obtainDidAccessToken(params: {
  did: string;
  portableDidJson: string;
}): Promise<DidAuthToken> {
  let did = params.did;
  try {
    const parsed = JSON.parse(params.portableDidJson) as { uri?: unknown };
    if (typeof parsed.uri === 'string' && parsed.uri && parsed.uri !== did) {
      // eslint-disable-next-line no-console
      console.warn('[DID auth] didUri != portableDid.uri; signing as portableDid.uri');
      did = parsed.uri;
    }
  } catch {
    // portableDid JSON is validated by the signer
  }
  try {
    const challenge = await requestDidChallenge(did);
    const signature = signDidAuthMessage(challenge.message, params.portableDidJson);
    return await requestDidToken({
      did,
      challengeId: challenge.challengeId,
      signature,
    });
  } catch (error) {
    throw didAuthHttpError(error);
  }
}
