import Constants from 'expo-constants';
import * as Updates from 'expo-updates';

type Extra = Record<string, unknown> | undefined;

function getExtra(): Extra {
  // expoConfig is available in SDK 49+ for most build types.
  return Constants.expoConfig?.extra as Extra;
}

function getExtraFromAppJson(): Extra {
  // In local Gradle release builds, neither process.env nor Constants/Updates
  // may expose `extra`. Bundling app.json guarantees access.
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const appJson = require('../app.json') as { expo?: { extra?: unknown } } | undefined;
    const extra = appJson?.expo?.extra;
    return (extra && typeof extra === 'object' ? (extra as Record<string, unknown>) : undefined) as Extra;
  } catch {
    return undefined;
  }
}

function getExtraFromUpdates(): Extra {
  // In release builds (especially local Gradle builds), Constants.expoConfig may be undefined.
  // expo-updates embeds a manifest that includes `extra`.
  const m = (Updates as unknown as { manifest?: unknown }).manifest;
  if (m && typeof m === 'object' && 'extra' in m) {
    const extra = (m as { extra?: unknown }).extra;
    return (extra && typeof extra === 'object' ? (extra as Record<string, unknown>) : undefined) as Extra;
  }
  return undefined;
}

export function getPublicEnv(key: string): string | undefined {
  // Prefer build-time inlined env vars (EAS / Metro / Expo export embed).
  const fromProcess =
    typeof process !== 'undefined' ? (process.env?.[key] as string | undefined) : undefined;
  if (fromProcess) return fromProcess;

  // Fallback to app.json `expo.extra.publicEnv` via Constants and expo-updates.
  const extraFromConstants =
    getExtra() ?? ((Constants.manifest as unknown as { extra?: unknown } | null)?.extra as Extra);
  const mergedExtra = extraFromConstants ?? getExtraFromUpdates() ?? getExtraFromAppJson();

  const publicEnv =
    mergedExtra && typeof mergedExtra === 'object'
      ? (mergedExtra.publicEnv as Record<string, unknown> | undefined)
      : undefined;
  const fromExtra = publicEnv?.[key];
  return typeof fromExtra === 'string' ? fromExtra : undefined;
}

