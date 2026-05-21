# Welcome to IDA 👋

"IDA Ciudadano" is a Self-Sovereign Identity (SSI) application designed to enable citizens to manage and present their digital credentials securely and autonomously, without the need for internet connectivity for validation. This application is part of a broader system aimed at demonstrating the potential and practicality of SSI technology in real-world situations.

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

3. Configure local environment variables

   ```bash
   cp .env.example .env
   ```

   Update `.env` with the API key and endpoints for your target environment.

4. Add Firebase Android config

   This repo ignores `google-services.json` on purpose. Download your own
   `google-services.json` from Firebase Console and place it at the project
   root:

   - `./google-services.json`

   For EAS cloud builds, upload it as a file environment variable (already
   configured for this project if you have access):

   ```bash
   eas env:create --environment production --name GOOGLE_SERVICES_JSON --type file --value ./google-services.json --visibility secret
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## EAS environments

This app is configured to read all `EXPO_PUBLIC_*` values from EAS environment
variables (not from committed secrets in `eas.json`).

- `development`: local/team testing (Rootstock testnet)
- `preview`: internal APK builds (Rootstock testnet)
- `production`: release builds (Rootstock mainnet + `https://api-ssi.iovf.org`)

Create or update values:

```bash
eas env:create --environment production --name EXPO_PUBLIC_API_KEY --value "<your-key>" --visibility sensitive
eas env:list --environment production
```

Build examples:

```bash
eas build --profile preview --platform android
eas build --profile production --platform android
eas build --profile production --platform ios
```

## Contributing

The main purpose of this repository is to continue evolving IDA, making it faster and easier to use. Development of IDA happens in the open on GitHub, and we are grateful to the community for contributing bugfixes and improvements. Read below to learn how you can take part in improving it.

### Code of Conduct

IDA has adopted a Code of Conduct that we expect project participants to adhere to. Please read [the full text](./CODE_OF_CONDUCT.md) so that you can understand what actions will and will not be tolerated.

### Contributing Guide

Read our [contributing guide](./CONTRIBUTING.md) to learn about our development process, how to propose bugfixes and improvements, and how to build and test your changes to IDA.

### License

React is [Apache 2.0](./LICENSE).
