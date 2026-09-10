import Constants from 'expo-constants';
import * as Updates from 'expo-updates';

type Extra = Record<string, unknown> | undefined;

/**
 * Static reads so Metro/EAS can inline EXPO_PUBLIC_* at bundle time.
 * Dynamic `process.env[key]` is NOT replaced and is empty in release APKs.
 */
function getFromProcessEnv(key: string): string | undefined {
  switch (key) {
    case 'EXPO_PUBLIC_API_BASE_URL':
      return process.env.EXPO_PUBLIC_API_BASE_URL;
    case 'EXPO_PUBLIC_API_KEY':
      return process.env.EXPO_PUBLIC_API_KEY;
    case 'EXPO_PUBLIC_IPFS_GATEWAY_BASE_URL':
      return process.env.EXPO_PUBLIC_IPFS_GATEWAY_BASE_URL;
    case 'EXPO_PUBLIC_WEB3_CHAIN_ID':
      return process.env.EXPO_PUBLIC_WEB3_CHAIN_ID;
    case 'EXPO_PUBLIC_WEB3_RPC_URL':
      return process.env.EXPO_PUBLIC_WEB3_RPC_URL;
    case 'EXPO_PUBLIC_WEB3_CONTRACT_ADDRESS':
      return process.env.EXPO_PUBLIC_WEB3_CONTRACT_ADDRESS;
    case 'EXPO_PUBLIC_WEB3_NETWORK_NAME':
      return process.env.EXPO_PUBLIC_WEB3_NETWORK_NAME;
    default: {
      const v =
        typeof process !== 'undefined'
          ? (process.env?.[key] as string | undefined)
          : undefined;
      return v;
    }
  }
}

function getExtra(): Extra {
  return Constants.expoConfig?.extra as Extra;
}

function getExtraFromAppJson(): Extra {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const appJson = require('../app.json') as
      | { expo?: { extra?: unknown } }
      | undefined;
    const extra = appJson?.expo?.extra;
    return (
      extra && typeof extra === 'object'
        ? (extra as Record<string, unknown>)
        : undefined
    ) as Extra;
  } catch {
    return undefined;
  }
}

function getExtraFromUpdates(): Extra {
  const m = (Updates as unknown as { manifest?: unknown }).manifest;
  if (m && typeof m === 'object' && 'extra' in m) {
    const extra = (m as { extra?: unknown }).extra;
    return (
      extra && typeof extra === 'object'
        ? (extra as Record<string, unknown>)
        : undefined
    ) as Extra;
  }
  return undefined;
}

export function getPublicEnv(key: string): string | undefined {
  const fromProcess = getFromProcessEnv(key);
  if (fromProcess) return fromProcess;

  const extraFromConstants =
    getExtra() ??
    ((Constants.manifest as unknown as { extra?: unknown } | null)?.extra as Extra);
  const mergedExtra =
    extraFromConstants ?? getExtraFromUpdates() ?? getExtraFromAppJson();

  const publicEnv =
    mergedExtra && typeof mergedExtra === 'object'
      ? (mergedExtra.publicEnv as Record<string, unknown> | undefined)
      : undefined;
  const fromExtra = publicEnv?.[key];
  return typeof fromExtra === 'string' && fromExtra.length > 0
    ? fromExtra
    : undefined;
}
