import { Stack, useRouter, useSegments } from 'expo-router';
import { RootSiblingParent } from 'react-native-root-siblings';
import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import {
  MD3LightTheme as DefaultTheme,
  PaperProvider,
  IconButton,
} from 'react-native-paper';
import { Image } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initDatabase } from '@/database/db';
import Ionicons from '@expo/vector-icons/Ionicons';
import { CustomTheme } from '@/@types/theme';
import { ModalProvider } from '@/providers/ModalProvider';
import { Modal } from '@/components/Modal';
import { DidProvider } from '@/providers/DidProvider';
import './i18n';

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
    primary: '#00ff85',
    secondary: '#535353',
    background: '#444',
  },
  customColors: {
    typography: {
      primary: '#FFF',
      secondary: '#CCC',
      color3: '#333',
    },
    background: {
      primary: '#3a3a3a',
      secondary: '#444',
      color3: '#555',
      color4: '#2c2c2c',
    },
  },
} as CustomTheme;

export default function RootLayout() {
  const queryClient = new QueryClient();
  const [loaded] = useFonts({
    Roboto: require('../assets/fonts/Roboto-Regular.ttf'),
    RobotoBold: require('../assets/fonts/Roboto-Bold.ttf'),
  });
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    (async function initializeApp() {
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
    <DidProvider>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={theme}>
          <ModalProvider>
            <RootSiblingParent>
              <Stack
                screenOptions={{
                  headerStyle: {
                    backgroundColor: '#343434',
                  },
                  headerTintColor: '#4c4c4c',
                  headerTitleStyle: {
                    fontWeight: 'bold',
                  },
                  headerTitleAlign: 'center',
                  headerTitle: () => (
                    <Image
                      source={require('../assets/images/logo-iovf.png')}
                      style={{ width: 80, height: 30 }}
                    />
                  ),
                  headerLeft: () =>
                    segments.length > 0 &&
                    segments[0] === 'identitySubmission' && (
                      <IconButton
                        icon={() => (
                          <Ionicons
                            name="home-outline"
                            size={24}
                            color={theme.customColors.typography.secondary}
                            style={{ marginBottom: 10 }}
                          />
                        )}
                        onPress={() => router.back()}
                      />
                    ),
                }}
              >
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="+not-found" />
              </Stack>
            </RootSiblingParent>
            <Modal />
          </ModalProvider>
        </PaperProvider>
      </QueryClientProvider>
    </DidProvider>
  );
}
