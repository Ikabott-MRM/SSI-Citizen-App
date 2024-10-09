import crypto from 'react-native-quick-crypto';

const hardcodedPassword = 'your-hardcoded-password'; // Use a hardcoded password for now

//TODO definir cmo se genera la encryption key. ver pros y contras 

// Function to hash the password and generate a 32-byte encryption key
const generateEncryptionKey = (password: string) => {
  return crypto.createHash('sha256').update(password).digest();
};

const generateSalt = () => {
return  crypto.randomBytes(16); // Generate a random salt
}

//TODO falta poder usar scrypt

// Function to encrypt data using AES-256-CBC
export const encryptData = (data: string) => {
  // Derive encryption key from password
  const encryptionKey = generateEncryptionKey(hardcodedPassword);

  // Generate a random 16-byte IV (Initialization Vector)
  const iv = crypto.randomBytes(16);

  // Create cipher instance
  const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);

  // Encrypt data
  let encrypted = cipher.update(data, 'utf8', 'hex') as string;
  encrypted += cipher.final('hex');

  // Return IV and encrypted data as an object
  const fileContent = {
    iv: iv.toString('hex'),
    encryptedData: encrypted,
  };

  return fileContent;
};
