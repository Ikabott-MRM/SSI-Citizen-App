import { MMKV } from 'react-native-mmkv';
import * as ExpoSecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QuickCrypto from 'react-native-quick-crypto';

let secureStoreInstance: SecureMMKV | null = null;

export interface SecureStore {
  setItem: (key: string, value: string) => Promise<void>;
  getItem: (key: string) => Promise<string | null>;
  deleteItem: (key: string) => Promise<void>;
}

export class SecureMMKV implements SecureStore {
  private storage: MMKV;

  constructor(encryptionKey: string) {
    this.storage = new MMKV({
      id: 'ida-secure-storage',
      encryptionKey,
    });
  }

  async setItem(key: string, value: string): Promise<void> {
    this.storage.set(key, value);
  }

  async getItem(key: string): Promise<string | null> {
    return this.storage.getString(key) || null;
  }

  async deleteItem(key: string): Promise<void> {
    this.storage.delete(key);
  }
}

export class ExpoSecureStorage implements SecureStore {
  async setItem(key: string, value: string): Promise<void> {
    await ExpoSecureStore.setItemAsync(key, value);
  }

  async getItem(key: string): Promise<string | null> {
    return await ExpoSecureStore.getItemAsync(key);
  }

  async deleteItem(key: string): Promise<void> {
    await ExpoSecureStore.deleteItemAsync(key);
  }
}

export class EncryptedAsyncStorage implements SecureStore {
  private encryptionKey: Buffer;

  constructor(encryptionKey: string) {
    this.encryptionKey = Buffer.from(encryptionKey, 'hex');
  }

  private encrypt(data: string): string {
    const iv = QuickCrypto.randomBytes(16);
    const cipher = QuickCrypto.createCipheriv(
      'aes-256-cbc',
      this.encryptionKey,
      iv,
    );
    let encrypted = cipher.update(data, 'utf8', 'hex') as string;
    encrypted += cipher.final('hex') as string;
    return iv.toString('hex') + encrypted;
  }

  private decrypt(encryptedData: string): string {
    const ivHex = encryptedData.slice(0, 32);
    const encryptedText = encryptedData.slice(32);
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = QuickCrypto.createDecipheriv(
      'aes-256-cbc',
      this.encryptionKey,
      iv,
    );
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8') as string;
    decrypted += decipher.final('utf8') as string;
    return decrypted;
  }

  async setItem(key: string, value: string): Promise<void> {
    const encryptedValue = this.encrypt(value);
    await AsyncStorage.setItem(key, encryptedValue);
  }

  async getItem(key: string): Promise<string | null> {
    const encryptedValue = await AsyncStorage.getItem(key);
    if (encryptedValue) {
      return this.decrypt(encryptedValue);
    }
    return null;
  }

  async deleteItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  }
}

function generatePseudoRandomKey(length: number = 32): string {
  return QuickCrypto.randomBytes(length).toString('hex');
}

export async function getEncryptedAsyncStorageInstance(): Promise<EncryptedAsyncStorage> {
  let encryptionKey = await AsyncStorage.getItem('encryption-key');
  if (!encryptionKey) {
    encryptionKey = generatePseudoRandomKey();
    await AsyncStorage.setItem('encryption-key', encryptionKey);
  }
  return new EncryptedAsyncStorage(encryptionKey);
}

async function getOrCreateEncryptionKey(): Promise<string> {
  try {
    let key = await AsyncStorage.getItem('mmkv-encryption-key');

    if (!key) {
      const generatedKey = generatePseudoRandomKey();
      await AsyncStorage.setItem('mmkv-encryption-key', generatedKey);
      key = generatedKey;
    }

    return key;
  } catch (error) {
    console.error('Failed to access or create encryption key:', error);
    throw new Error('Error generating or accessing the encryption key');
  }
}

export async function getSecureMMKVInstance(): Promise<SecureMMKV | null> {
  try {
    if (!secureStoreInstance) {
      const encryptionKey = await getOrCreateEncryptionKey();
      secureStoreInstance = new SecureMMKV(encryptionKey);
    }
    return secureStoreInstance;
  } catch (error) {
    console.error('Error initializing SecureMMKV instance:', error);
    return null;
  }
}
