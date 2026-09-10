import * as Keychain from 'react-native-keychain';
import { obtainDidAccessToken } from './didAuth';

const TOKEN_SERVICE = 'did-access-token';
const TOKEN_ACCOUNT = 'user-did-access-token';

type SessionCredentials = {
  did: string;
  portableDidJson: string;
};

let memoryAccessToken: string | null = null;
let memoryExpiresAtMs: number | null = null;
let credentials: SessionCredentials | null = null;
let inFlightAuth: Promise<string | null> | null = null;

export function getDidAccessToken(): string | null {
  if (
    memoryAccessToken &&
    memoryExpiresAtMs != null &&
    Date.now() >= memoryExpiresAtMs - 15_000
  ) {
    // Treat near-expiry as missing so callers re-auth.
    return null;
  }
  return memoryAccessToken;
}

export function clearDidAccessToken(): void {
  memoryAccessToken = null;
  memoryExpiresAtMs = null;
}

export function setDidSessionCredentials(
  next: SessionCredentials | null,
): void {
  credentials = next;
  if (!next) {
    clearDidAccessToken();
  }
}

export function getDidSessionCredentials(): SessionCredentials | null {
  return credentials;
}

async function persistToken(token: string): Promise<void> {
  try {
    await Keychain.setGenericPassword(TOKEN_ACCOUNT, token, {
      service: TOKEN_SERVICE,
    });
  } catch {
    // Memory remains source of truth; Keychain persistence is best-effort.
  }
}

export async function loadPersistedDidAccessToken(): Promise<string | null> {
  try {
    const stored = await Keychain.getGenericPassword({
      service: TOKEN_SERVICE,
    });
    if (stored && stored.password) {
      memoryAccessToken = stored.password;
      // Unknown expiry from prior launch; keep until 401 triggers refresh.
      memoryExpiresAtMs = null;
      return memoryAccessToken;
    }
  } catch {
    // ignore
  }
  return null;
}

export async function clearPersistedDidAccessToken(): Promise<void> {
  clearDidAccessToken();
  try {
    await Keychain.resetGenericPassword({ service: TOKEN_SERVICE });
  } catch {
    // ignore
  }
}

/**
 * Obtain (or refresh) a DID access token using current credentials.
 * Dedupes concurrent calls.
 */
export async function ensureDidAccessToken(options?: {
  force?: boolean;
}): Promise<string | null> {
  if (!options?.force) {
    const existing = getDidAccessToken();
    if (existing) return existing;
  }

  if (inFlightAuth) {
    return inFlightAuth;
  }

  inFlightAuth = (async () => {
    if (!credentials?.did || !credentials?.portableDidJson) {
      return null;
    }
    try {
      const { accessToken, expiresIn } = await obtainDidAccessToken({
        did: credentials.did,
        portableDidJson: credentials.portableDidJson,
      });
      memoryAccessToken = accessToken;
      memoryExpiresAtMs =
        typeof expiresIn === 'number' && expiresIn > 0
          ? Date.now() + expiresIn * 1000
          : null;
      await persistToken(accessToken);
      return accessToken;
    } catch (error) {
      // Do not log token/portableDid material.
      // eslint-disable-next-line no-console
      console.error('[DID auth] Failed to obtain access token');
      clearDidAccessToken();
      throw error;
    } finally {
      inFlightAuth = null;
    }
  })();

  return inFlightAuth;
}

/** Paths that must not trigger Bearer attach / 401 re-auth loops. */
export function isDidAuthEndpoint(url: string | undefined): boolean {
  if (!url) return false;
  return (
    url.includes('/auth/did/challenge') || url.includes('/auth/did/token')
  );
}

/** Subject routes that require DID JWT (requests under a DID). */
export function isDidSubjectRoute(url: string | undefined): boolean {
  if (!url) return false;
  // /requests/:did/request(s) and similar subject-scoped paths
  return /\/requests\/[^/]+\/(request|requests)/.test(url);
}
