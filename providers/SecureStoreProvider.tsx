import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSecureMMKVInstance, SecureMMKV } from '@/services/secure-store';
import {
  Alert,
    Platform,
  } from 'react-native';
  
const SecureStoreContext = createContext<SecureMMKV | null>(null);

export const useSecureStore = () => useContext(SecureStoreContext);

export const SecureStoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [secureStore, setSecureStore] = useState<SecureMMKV | null>(null);

  useEffect(() => {
    const initializeSecureStore = async () => {
      if (Platform.OS !== 'web') {
        try {
          const store = await getSecureMMKVInstance();
          if (store) {
            setSecureStore(store);
          } else {
            Alert.alert('Error', 'Failed to initialize secure storage.');
          }
        } catch (error) {
          console.error('Failed to initialize secure store:', error);
          Alert.alert('Error', 'An unexpected error occurred.');
        }
      } else {
        console.warn('Secure storage is not available on the web platform.');
      }
    };

    initializeSecureStore();

  }, []);

  return (
    <SecureStoreContext.Provider value={secureStore}>
      {children}
    </SecureStoreContext.Provider>
  );
};
