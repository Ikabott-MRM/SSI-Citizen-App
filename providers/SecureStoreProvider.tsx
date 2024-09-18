import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSecureMMKVInstance, SecureMMKV } from '@/services/secure-store';
import {
    Platform,
  } from 'react-native';
  
const SecureStoreContext = createContext<SecureMMKV | null>(null);

export const useSecureStore = () => useContext(SecureStoreContext);

export const SecureStoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [secureStore, setSecureStore] = useState<SecureMMKV | null>(null);

  useEffect(() => {
    const initializeSecureStore = async () => {
      if (Platform.OS !== 'web') {
        const store = await getSecureMMKVInstance();
        setSecureStore(store);
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
