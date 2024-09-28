import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Alert,
    Platform,
  } from 'react-native';
import { KEY_DID_SECURE_STORE } from '@/constants/secureStore';
  
import {
  getEncryptedAsyncStorageInstance,
  SecureStore,
} from '@/services/secure-store';

 type SecureStoreContextType = {
   secureStoreInstance: SecureStore| null;
   did: string | null;
   setDid: React.Dispatch<React.SetStateAction<string | null>>;
 };

const SecureStoreContext = createContext<SecureStoreContextType | undefined>(undefined);

export const useSecureStore = () => {
  const context = useContext(SecureStoreContext);
  if (!context) {
    throw new Error('useSecureStore must be used within a SecureStoreProvider');
  }
  return context;
};

export const SecureStoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [secureStoreInstance, setSecureStore] = useState<SecureStore| null>(null);
  const [did, setDid] = useState<string | null>(null);

  useEffect(() => {
    const initializeSecureStore = async () => {
      if (Platform.OS !== 'web') {
        try {
          const store = await getEncryptedAsyncStorageInstance();
          if (store) {
            setSecureStore(store);
            const storedDid = await store!.getItem(KEY_DID_SECURE_STORE);
            if (storedDid) {
              setDid(storedDid);
            }
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
    <SecureStoreContext.Provider value={{ secureStoreInstance, did, setDid }} >
      {children}
    </SecureStoreContext.Provider>
  );
};
