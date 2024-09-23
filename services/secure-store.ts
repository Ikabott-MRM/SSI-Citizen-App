import { MMKV } from 'react-native-mmkv';
import * as Crypto from 'expo-crypto';
let secureStoreInstance: SecureMMKV | MMKVFaker | null = null;
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

export class MMKVFaker {
  private data: { [key: string]: string | null } = {};
  
  getItem(key: string): string | null {
  return this.data[key];
  }
  
  setItem(key: string, value: string): void {
  this.data[key] = value;
  }
  
  deleteItem(key: string): void {
  delete this.data[key];
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

export async function getSecureMMKVInstance(): Promise<SecureMMKV | MMKVFaker | null> {
  try {
    if (!secureStoreInstance) {
      if(__DEV__) {
       secureStoreInstance = new MMKVFaker()
      }else{
      const encryptionKey = await getOrCreateEncryptionKey();
      secureStoreInstance = new SecureMMKV(encryptionKey);
      }
    }
    return secureStoreInstance;
  } catch (error) {
    console.error('Error initializing SecureMMKV instance:', error);
    return null; 
  }
}
