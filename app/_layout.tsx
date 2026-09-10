import './i18n';
import i18n from './i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKey } from '@/@types/language';
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
import { tenantBrand } from '@/constants/brand';
import { ModalProvider } from '@/providers/ModalProvider';
import { Modal } from '@/components/Modal';
import { DidProvider } from '@/providers/DidProvider';
import { DidSessionProvider } from '@/providers/DidSessionProvider';
import { FormModal } from '@/components/FormModal';

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
    primary: tenantBrand.primary,
    onPrimary: tenantBrand.onPrimary,
    secondary: tenantBrand.accent,
    onSecondary: tenantBrand.onPrimary,
    background: '#FFFFFF',
    surface: '#FFFFFF',
    onSurface: tenantBrand.primaryDark,
    onBackground: tenantBrand.primaryDark,
  },
  customColors: {
    typography: {
      primary: tenantBrand.primaryDark,
      secondary: '#4A4A4A',
      color3: tenantBrand.onPrimary,
    },
    background: {
      primary: '#FFFFFF',
      secondary: '#F5F7F7',
      color3: '#EEF2F2',
      color4: '#E4EAEA',
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
    (async function restoreLanguage() {
      try {
        const saved = await AsyncStorage.getItem(StorageKey.language);
        if (saved === 'en' || saved === 'es') {
          await i18n.changeLanguage(saved);
        }
      } catch {
        // ignore
      }
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
      <DidSessionProvider>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={theme}>
          <ModalProvider>
            <RootSiblingParent>
              <Stack
                screenOptions={{
                  headerStyle: {
                    backgroundColor: tenantBrand.headerBackground,
                  },
                  headerTintColor: tenantBrand.slug === 'geyser' ? tenantBrand.primaryDark : '#4c4c4c',
                  headerTitleStyle: {
                    fontWeight: 'bold',
                  },
                  headerTitleAlign: 'center',
                  headerTitle: () => (
                    <Image
                      source={tenantBrand.logo}
                      style={{ width: 120, height: 40, resizeMode: 'contain' }}
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
            <FormModal />
            <Modal />
          </ModalProvider>
        </PaperProvider>
      </QueryClientProvider>
      </DidSessionProvider>
    </DidProvider>
  );
}
