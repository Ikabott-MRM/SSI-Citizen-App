const appJson = require('./app.json');

/**
 * Bake into expo.extra so release APKs can read them via getPublicEnv.
 * Public env comes only from process.env (EAS Environment / local .env).
 * Never hardcode API keys here.
 */
const apiBaseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.ssi-api.xyz';
const apiKey = process.env.EXPO_PUBLIC_API_KEY || '';
const ipfsGateway =
  process.env.EXPO_PUBLIC_IPFS_GATEWAY_BASE_URL ||
  'https://gateway.pinata.cloud';

const isReleaseLike =
  Boolean(process.env.EAS_BUILD) ||
  Boolean(process.env.CI) ||
  process.env.NODE_ENV === 'production';

if (!apiKey && isReleaseLike) {
  throw new Error(
    'EXPO_PUBLIC_API_KEY is missing. Set it in Expo EAS Environment variables (production / per-tenant) or in a local .env — never commit keys. See EAS_ENV_SETUP.md.'
  );
}

const publicEnv = {
  EXPO_PUBLIC_API_BASE_URL: apiBaseUrl,
  EXPO_PUBLIC_API_KEY: apiKey,
  EXPO_PUBLIC_IPFS_GATEWAY_BASE_URL: ipfsGateway,
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
