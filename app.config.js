const appJson = require('./app.json');

/**
 * Bake into expo.extra so release APKs can read them via getPublicEnv.
 * Public env comes only from process.env (EAS Environment / local .env).
 * Never hardcode API keys here.
 *
 * Tenant branding: set EXPO_PUBLIC_TENANT_SLUG=geyser|avaldao on the EAS profile.
 */
const apiBaseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.ssi-api.xyz';
const apiKey = process.env.EXPO_PUBLIC_API_KEY || '';
const ipfsGateway =
  process.env.EXPO_PUBLIC_IPFS_GATEWAY_BASE_URL ||
  'https://gateway.pinata.cloud';

const tenantSlug = (process.env.EXPO_PUBLIC_TENANT_SLUG || 'geyser')
  .trim()
  .toLowerCase();

const tenantMeta = {
  geyser: {
    displayName: 'Geyser Ciudadano',
    androidPackage: 'com.ikabott.ssi.citizen.geyser',
    iosBundle: 'com.ikabott.ssi.citizen.geyser',
    adaptiveBg: '#00F5DC',
    splashBg: '#FFFFFF',
  },
  avaldao: {
    displayName: 'AvalDAO Ciudadano',
    androidPackage: 'com.ikabott.ssi.citizen.avaldao',
    iosBundle: 'com.ikabott.ssi.citizen.avaldao',
    adaptiveBg: '#292A6D',
    splashBg: '#FFFFFF',
  },
}[tenantSlug] || {
  displayName: 'SSI Ciudadano',
  androidPackage: 'com.ikabott.ssi.citizen',
  iosBundle: 'com.ikabott.ssi.citizen',
  adaptiveBg: '#0B3D6E',
  splashBg: '#FFFFFF',
};

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
  EXPO_PUBLIC_TENANT_SLUG: tenantSlug,
};

/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  expo: {
    ...appJson.expo,
    name: tenantMeta.displayName,
    splash: {
      ...appJson.expo.splash,
      backgroundColor: tenantMeta.splashBg,
    },
    ios: {
      ...appJson.expo.ios,
      bundleIdentifier: tenantMeta.iosBundle,
    },
    android: {
      ...appJson.expo.android,
      package: tenantMeta.androidPackage,
      adaptiveIcon: {
        ...appJson.expo.android?.adaptiveIcon,
        backgroundColor: tenantMeta.adaptiveBg,
      },
      googleServicesFile:
        process.env.GOOGLE_SERVICES_JSON ??
        appJson.expo.android.googleServicesFile,
    },
    extra: {
      ...appJson.expo.extra,
      publicEnv,
      tenantSlug,
    },
  },
};
