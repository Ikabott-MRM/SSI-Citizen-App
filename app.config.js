const appJson = require('./app.json');

/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  expo: {
    ...appJson.expo,
    android: {
      ...appJson.expo.android,
      // Local: ./google-services.json (gitignored). EAS Build: file env var path.
      googleServicesFile:
        process.env.GOOGLE_SERVICES_JSON ?? appJson.expo.android.googleServicesFile,
    },
  },
};
