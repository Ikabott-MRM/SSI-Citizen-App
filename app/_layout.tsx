import { Stack } from 'expo-router';
import { RootSiblingParent } from 'react-native-root-siblings';
import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import {
  MD3LightTheme as DefaultTheme,
  PaperProvider,
} from 'react-native-paper';
import { DevSettings, Image } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { deleteCredentials, initDatabase } from '@/database/db';
import * as SecureStore from 'expo-secure-store';
import { KEY_DID_SECURE_STORE } from '@/constants/secureStore';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#65CDA3',
    secondary: '#535353',
  },
};

export default function RootLayout() {
  const queryClient = new QueryClient();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    (async function initializeApp() {
      if (__DEV__) {
        DevSettings.addMenuItem('Clear Data', async function clearData() {
          console.log('Clear Data');
          await deleteCredentials();
          await SecureStore.deleteItemAsync(KEY_DID_SECURE_STORE);
          DevSettings.reload();
        });
      }

      await initDatabase();
    })();
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={theme}>
        <RootSiblingParent>
          <Stack>
            <Stack.Screen
              name="(tabs)"
              options={{
                headerTitleAlign: 'center',
                headerTitle: () => (
                  <Image
                    source={require('../assets/images/logo-iovf.png')}
                    style={{ width: 150, height: 60 }}
                  />
                ),
              }}
            />
            <Stack.Screen name="+not-found" />
          </Stack>
        </RootSiblingParent>
      </PaperProvider>
    </QueryClientProvider>
  );
}
