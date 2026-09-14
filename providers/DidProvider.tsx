import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import i18n from '@/app/i18n';
import { deleteCredentials } from '@/database/db';

const PORTABLE_DID_SERVICE = 'portable-did';
const PORTABLE_DID_ACCOUNT = 'user-portable-did';
/** Mirror of Keychain portable DID — survives Keychain service mismatches. */
const PORTABLE_DID_STORAGE_KEY = 'portable-did-json';

type DidContextType = {
  didUri: string | null;
  portableDid: string | null;
  isBackupDeclined: boolean;
  isBackupCompleted: string | null;
  vCodeAttempts: number;
  verificationCode: string;
  setVerificationCode: (value: string) => void;
  incrementVCodeAttempts: () => void;
  resetVCodeAttempts: () => void;
  setDidUri: (value: string) => void;
  setPortableDid: (value: string) => void;
  /** Set uri + portable JSON in one React render so DID auth cannot race. */
  setDidPair: (uri: string, portableJson: string) => Promise<void>;
  setIsBackupDeclined: (value: boolean) => void;
  setBackupCompleted: (value: string) => void;
};

const DidContext = createContext<DidContextType | undefined>(undefined);

export const useDid = () => {
  const context = useContext(DidContext);
  if (!context) {
    throw new Error('useDid must be used within a DidProvider');
  }
  return context;
};

/** Reject JWTs / empty strings accidentally stored in Keychain. */
export function isPortableDidJson(value: string | null | undefined): value is string {
  if (!value || typeof value !== 'string') return false;
  try {
    const parsed = JSON.parse(value) as { privateKeys?: unknown; uri?: unknown };
    return Array.isArray(parsed.privateKeys) && parsed.privateKeys.length > 0;
  } catch {
    return false;
  }
}

function portableUri(portableJson: string): string | null {
  try {
    const parsed = JSON.parse(portableJson) as { uri?: unknown };
    return typeof parsed.uri === 'string' && parsed.uri ? parsed.uri : null;
  } catch {
    return null;
  }
}

async function readPortableDidCandidates(): Promise<string[]> {
  const candidates: string[] = [];
  try {
    const named = await Keychain.getGenericPassword({
      service: PORTABLE_DID_SERVICE,
    });
    if (named?.password) candidates.push(named.password);
  } catch {
    // ignore
  }
  try {
    const fallback = await Keychain.getGenericPassword();
    if (fallback?.password) candidates.push(fallback.password);
  } catch {
    // ignore
  }
  try {
    const fromStorage = await AsyncStorage.getItem(PORTABLE_DID_STORAGE_KEY);
    if (fromStorage) candidates.push(fromStorage);
  } catch {
    // ignore
  }
  return candidates;
}

async function persistPortableDid(portableJson: string | null): Promise<void> {
  if (portableJson) {
    try {
      await Keychain.setGenericPassword(PORTABLE_DID_ACCOUNT, portableJson, {
        service: PORTABLE_DID_SERVICE,
      });
    } catch (error) {
      console.error('Error saving portable did to Keychain', error);
    }
    try {
      await AsyncStorage.setItem(PORTABLE_DID_STORAGE_KEY, portableJson);
    } catch (error) {
      console.error('Error saving portable did to AsyncStorage', error);
    }
  } else {
    try {
      await Keychain.resetGenericPassword({ service: PORTABLE_DID_SERVICE });
    } catch {
      // ignore
    }
    try {
      await AsyncStorage.removeItem(PORTABLE_DID_STORAGE_KEY);
    } catch {
      // ignore
    }
  }
}

export const DidProvider = ({ children }: { children: React.ReactNode }) => {
  const [portableDid, setPortableDidState] = useState<string | null>(null);
  const [didUri, setDidUriState] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [vCodeAttempts, setVCodeAttempts] = useState(0);
  const [isBackupDeclined, setIsBackupDeclinedState] = useState<boolean>(false);
  const [isBackupCompleted, setIsBackupCompletedState] = useState<
    string | null
  >(null);

  const incrementVCodeAttempts = () => setVCodeAttempts(prev => prev + 1);
  const resetVCodeAttempts = () => setVCodeAttempts(0);

  useEffect(() => {
    const loadDidData = async () => {
      try {
        const storedDidUri = await AsyncStorage.getItem('did-uri');
        const candidates = await readPortableDidCandidates();
        const matching =
          candidates.find(c => {
            if (!isPortableDidJson(c)) return false;
            if (!storedDidUri) return true;
            const uri = portableUri(c);
            return !uri || uri === storedDidUri;
          }) ?? null;

        if (storedDidUri && matching) {
          setDidUriState(storedDidUri);
          setPortableDidState(matching);
          await persistPortableDid(matching);
        } else if (matching && !storedDidUri) {
          const uri = portableUri(matching);
          if (uri) {
            setDidUriState(uri);
            setPortableDidState(matching);
            await AsyncStorage.setItem('did-uri', uri);
            await persistPortableDid(matching);
          }
        } else if (storedDidUri && !matching) {
          // Orphan URI (Rocky VC visible, Confirm → DidKeysMissing). Clear it.
          console.warn('[DID] Clearing orphan did-uri without portable keys');
          await AsyncStorage.removeItem('did-uri');
          await persistPortableDid(null);
          try {
            await deleteCredentials();
          } catch {
            // ignore
          }
          setDidUriState(null);
          setPortableDidState(null);
          Alert.alert(
            i18n.t('Error'),
            i18n.t('DidKeysMissing'),
          );
        }

        const backupDeclined =
          (await AsyncStorage.getItem('backupDeclined')) ||
          (await AsyncStorage.getItem('backup-declined'));
        if (backupDeclined) {
          setIsBackupDeclinedState(true);
        }
      } catch (error) {
        console.error('Failed to load initial did data.:', error);
        Alert.alert(
          i18n.t('Error'),
          i18n.t('An unexpected error occurred.'),
        );
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

  const setDidPair = async (uri: string, portableJson: string) => {
    // Both React states before any await → one render, matching pair.
    if (portableJson) {
      setPortableDidState(portableJson);
    } else {
      setPortableDidState(null);
    }
    if (uri) {
      setDidUriState(uri);
    } else {
      setDidUriState(null);
    }
    if (didUri && uri && didUri !== uri) {
      try {
        await deleteCredentials();
      } catch {
        // local cache is best-effort
      }
    }
    await persistPortableDid(portableJson || null);
    try {
      if (uri) {
        await AsyncStorage.setItem('did-uri', uri);
      } else {
        await AsyncStorage.removeItem('did-uri');
      }
    } catch (error) {
      console.error('Error saving DID URI to AsyncStorage', error);
    }
  };

  const setPortableDid = async (value: string) => {
    if (value) {
      setPortableDidState(value);
      await persistPortableDid(value);
    } else {
      setPortableDidState(null);
      await persistPortableDid(null);
    }
  };

  const setBackupCompleted = async (value: string) => {
    try {
      if (value) {
        await AsyncStorage.setItem('backup-completed', 'completed');
        setIsBackupCompletedState(value);
      } else {
        await AsyncStorage.removeItem('backup-completed');
        setIsBackupCompletedState(null);
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
        vCodeAttempts,
        verificationCode,
        incrementVCodeAttempts,
        resetVCodeAttempts,
        setVerificationCode,
        setDidUri,
        setPortableDid,
        setDidPair,
        isBackupDeclined,
        setIsBackupDeclined,
        isBackupCompleted,
        setBackupCompleted,
      }}
    >
      {children}
    </DidContext.Provider>
  );
};
