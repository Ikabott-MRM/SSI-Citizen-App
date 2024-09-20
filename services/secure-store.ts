import { MMKV } from 'react-native-mmkv';
import * as ExpoSecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
let secureStoreInstance: SecureMMKV | null = null;
import {Buffer} from 'buffer'
import AsyncStorage from '@react-native-async-storage/async-storage';

export class SecureMMKV {
  private storage: MMKV;

  constructor(encryptionKey: string) {
    this.storage = new MMKV({
      id: 'ida-secure-storage',
      encryptionKey,
    });
  }

  setItem(key: string, value: string): void {
    this.storage.set(key, value);
  }

  getItem(key: string): string | null {
    return this.storage.getString(key) || null;
  }

  deleteItem(key: string): void {
    this.storage.delete(key);
  }
}

export class ExpoSecureStorage {
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

async function generateSecureRandomKey(
  length: number = 32,
): Promise<string> {
  const randomBytes = await Crypto.getRandomBytesAsync(length);
  return Buffer.from(randomBytes).toString('hex');
}


async function getOrCreateEncryptionKey(): Promise<string> {
  try {
    let key = await AsyncStorage.getItem('mmkv-encryption-key');
    console.log(key)
    
    if (!key) {
      const generatedKey = await generateSecureRandomKey();
      await AsyncStorage.setItem('mmkv-encryption-key', generatedKey);
      key = generatedKey;
      console.log(key)
    }
    
    return key;
  } catch (error) {
    console.error('Failed to access or create encryption key:', error);
    throw new Error("Error generating or accessing the encryption key");
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
