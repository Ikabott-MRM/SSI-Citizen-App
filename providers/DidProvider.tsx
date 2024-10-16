import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

type DidContextType = {
  didUri: string | null;
  portableDid: string | null;
  isBackupDeclined: boolean;
  pwdForEncryption: string | null;
  setDidUri: (value: string) => void;
  setPortableDid: (value: string) => void;
  setIsBackupDeclined: (value: boolean) => void;
  setPwdForEncryption: (value: string) => void;
};

const DidContext = createContext<DidContextType | undefined>(undefined);

export const useDid = () => {
  const context = useContext(DidContext);
  if (!context) {
    throw new Error('useDid must be used within a DidProvider');
  }
  return context;
};

export const DidProvider = ({ children }: { children: React.ReactNode }) => {
  const [portableDid, setPortableDidState] = useState<string | null>(null);
  const [didUri, setDidUriState] = useState<string | null>(null);
  const [isBackupDeclined, setIsBackupDeclinedState] = useState<boolean>(false);
  const [pwdForEncryption, setPwdForEncryptionState] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const loadDidData = async () => {
      try {
        const storedDidUri = await AsyncStorage.getItem('did-uri');
        if (storedDidUri) {
          setDidUriState(storedDidUri);
          const portableDid = await Keychain.getGenericPassword();
          const backupDeclined = await AsyncStorage.getItem('backupDeclined');
          if (portableDid) {
            setPortableDidState(portableDid.password);
          }
          if (backupDeclined) {
            setIsBackupDeclinedState(true);
          }
        }
      } catch (error) {
        console.error('Failed to load initial did data.:', error);
        Alert.alert('Error', 'An unexpected error occurred.');
      }
    };
    loadDidData();
  }, []);

  const setDidUri = async (value: string) => {
    try {
      if (value) {
        await AsyncStorage.setItem('did-uri', value);
        setDidUriState(value);
      } else {
        await AsyncStorage.removeItem('did-uri');
        setDidUriState(null);
      }
    } catch (error) {
      console.error('Error saving DID URI to AsyncStorage', error);
    }
  };

  const setIsBackupDeclined = async (value: boolean) => {
    try {
      if (value) {
        await AsyncStorage.setItem('backup-declined', 'declined');
        setIsBackupDeclinedState(value);
      } else {
        await AsyncStorage.removeItem('backup-declined');
        setIsBackupDeclinedState(false);
      }
    } catch (error) {
      console.error(
        'Error saving user choice to decline backup to AsyncStorage',
        error,
      );
    }
  };

  const setPortableDid = async (value: string) => {
    try {
      if (value) {
        await Keychain.setGenericPassword('user-portable-did', value, {
          service: 'portable-did',
        });
        setPortableDidState(value);
      } else {
        await Keychain.resetGenericPassword({ service: 'portable-did' });
        setPortableDidState(null);
      }
    } catch (error) {
      console.error('Error saving portable did to Keychain', error);
    }
  };

  const setPwdForEncryption = async (value: string) => {
    try {
      if (value) {
        await Keychain.setGenericPassword('user-pwd', value, {
          service: 'pwd',
        });
        setPwdForEncryptionState(value);
      } else {
        await Keychain.resetGenericPassword({ service: 'pwd' });
        setPwdForEncryptionState(null);
      }
    } catch (error) {
      console.error('Error saving user password to Keychain', error);
    }
  };

  return (
    <DidContext.Provider
      value={{
        portableDid,
        didUri,
        setDidUri,
        setPortableDid,
        isBackupDeclined,
        setIsBackupDeclined,
        pwdForEncryption,
        setPwdForEncryption,
      }}
    >
      {children}
    </DidContext.Provider>
  );
};
