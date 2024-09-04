import { MMKV } from 'react-native-mmkv';
import * as ExpoSecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

export class SecureMMKV {
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

export async function generateSecureRandomKey(
  length: number = 32,
): Promise<string> {
  const randomBytes = await Crypto.getRandomBytesAsync(length);
  return Buffer.from(randomBytes).toString('hex');
}

export async function getOrCreateEncryptionKey(): Promise<string> {
  const expoStorage = new ExpoSecureStorage();
  let key = await expoStorage.getItem('mmkv-encryption-key');
  if (!key) {
    key = await generateSecureRandomKey();
    await expoStorage.setItem('mmkv-encryption-key', key);
  }
  return key;
}

export async function createSecureMMKV(): Promise<SecureMMKV> {
  const encryptionKey = await getOrCreateEncryptionKey();
  return new SecureMMKV(encryptionKey);
}

export { ExpoSecureStore };
