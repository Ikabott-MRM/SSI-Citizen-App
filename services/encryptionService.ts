import crypto from 'react-native-quick-crypto';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();
import { Buffer } from '@craftzdog/react-native-buffer';

const generateSalt = () => {
  return crypto.randomBytes(16);
};

//derive an encryption key from a password and salt
const deriveKeyGivenPasswordAndSalt = (password: string, salt: Buffer) => {
  //password Based Key Derivation 2 (PBKDF2)
  return crypto.pbkdf2Sync(password, salt, 100000, 32);
};

//encrypt data using AES-256-CBC
export const encryptData = async (data: string, password: string) => {
  console.log(`data a encriptar`, data);
  try {
    const salt = generateSalt();
    const encryptionKey = deriveKeyGivenPasswordAndSalt(password, salt);

    //generate a random 16-byte IV
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);

    //encrypt data
    let encrypted = cipher.update(data, 'utf8', 'hex') as string;
    encrypted += cipher.final('hex');

    //return iv, salt and encrypted data. All needed for decryption in case user wants to retrieve a DID
    const fileContent = {
      iv: iv.toString('hex'),
      encryptedData: encrypted,
      salt: salt.toString('hex'),
    };

    return fileContent;
  } catch (error) {
    Alert.alert(
      'Error',
      t(
        'An error occurred while encrypting the portableDid during the DID creation process.',
      ),
    );
    console.error('Encryption Error:', error);

  }
};

export const decryptData = async (
  fileContent: { iv: string; encryptedData: string; salt: string },
  password: string,
) => {
  try {
    const salt = Buffer.from(fileContent.salt, 'hex');
    const iv = Buffer.from(fileContent.iv, 'hex');

    const encryptionKey = deriveKeyGivenPasswordAndSalt(password, salt);

    const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, iv);

    let decrypted = decipher.update(
      fileContent.encryptedData,
      'hex',
      'utf8',
    ) as string;
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    Alert.alert(
      'Error',
      t(
        'An error occurred while decrypting the portableDid during the DID retrieval process.',
      ),
    );
    console.error('Decryption Error:', error);

  }
};
