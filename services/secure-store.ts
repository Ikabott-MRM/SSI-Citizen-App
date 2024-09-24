import { MMKV } from 'react-native-mmkv';
import * as ExpoSecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';

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
  private encryptionKey: string;

  constructor(encryptionKey: string) {
    this.encryptionKey = encryptionKey;
  }

  private encrypt(data: string): string {
    const iv = CryptoJS.lib.WordArray.random(16);
    const encrypted = CryptoJS.AES.encrypt(data, this.encryptionKey, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return iv.toString(CryptoJS.enc.Hex) + encrypted.toString();
  }

  private decrypt(encryptedData: string): string {
    const ivHex = encryptedData.slice(0, 32);
    const encryptedText = encryptedData.slice(32);
    const iv = CryptoJS.enc.Hex.parse(ivHex);
    const decrypted = CryptoJS.AES.decrypt(encryptedText, this.encryptionKey, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  async setItem(key: string, value: string): Promise<void> {
    const encryptedValue = this.encrypt(value);
    await AsyncStorage.setItem(key, encryptedValue);
  }

  async getItem(key: string): Promise<string | null> {
    const encryptedValue = await AsyncStorage.getItem(key);
    if (encryptedValue) {
      console.log('encrypted value', encryptedValue);
      return this.decrypt(encryptedValue);
    }
    return null;
  }

  async deleteItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  }
}

function generatePseudoRandomKey(length: number = 32): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const timestamp = new Date().getTime().toString();
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars.charAt(randomIndex);
  }
  return CryptoJS.SHA256(result + timestamp).toString();
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
