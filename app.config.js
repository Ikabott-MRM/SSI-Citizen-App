const appJson = require('./app.json');

/**
 * Bake into expo.extra so release APKs can read them via getPublicEnv.
 * Prefer EAS/profile env when it already points at the new API; otherwise force cutover values
 * (EAS "production" historically still had legacy iovf / old API keys).
 */
const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL || '';
const envKey = process.env.EXPO_PUBLIC_API_KEY || '';
const useEnvUrl =
  envUrl.includes('api.ssi-api.xyz') || envUrl.includes('32.193.115.213');
const useEnvKey =
  Boolean(envKey) &&
  envKey !== 'e8be2a7d799ac712e250317b1edf276c' &&
  !envKey.includes('api-key-for-interacting');

const publicEnv = {
  EXPO_PUBLIC_API_BASE_URL: useEnvUrl ? envUrl : 'https://api.ssi-api.xyz',
  EXPO_PUBLIC_API_KEY: useEnvKey
    ? envKey
    : 'fb9e01c186166997e295226f7f3c9871',
  EXPO_PUBLIC_IPFS_GATEWAY_BASE_URL:
    process.env.EXPO_PUBLIC_IPFS_GATEWAY_BASE_URL ||
    'https://gateway.pinata.cloud',
};

/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  expo: {
    ...appJson.expo,
    android: {
      ...appJson.expo.android,
      // Local: ./google-services.json (gitignored). EAS Build: file env var path.
      googleServicesFile:
        process.env.GOOGLE_SERVICES_JSON ??
        appJson.expo.android.googleServicesFile,
    },
    extra: {
      ...appJson.expo.extra,
      publicEnv,
    },
  },
};
