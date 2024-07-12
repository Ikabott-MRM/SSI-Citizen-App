import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';

export const SQLiteDatabase = SQLite.openDatabaseSync('iovf.db');

type DBCredential = {
  id: number;
  jwt: string;
  dataModelId: string;
  issuer: string;
  issuanceDate: string;
  expirationDate: string;
  firstname: string;
  lastname: string;
  licenseCategory: string;
};

export type MappedCredential = {
  verifiableCredential: {
    vcDataModel: {
      id: string;
      issuanceDate: string;
      expirationDate: string;
      issuer: string;
      credentialSubject: {
        firstname: string;
        lastname: string;
        licenseCategory: string;
      };
    };
  };
  vcJwt: string;
};

export type DBCredentials = DBCredential[];

export async function initDatabase() {
  await SQLiteDatabase.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS credential (
      id INTEGER PRIMARY KEY NOT NULL, 
      jwt TEXT NOT NULL,
      dataModelId TEXT NOT NULL, 
      issuer TEXT NOT NULL, 
      issuanceDate TEXT NOT NULL, 
      expirationDate TEXT NOT NULL,
      firstname TEXT NOT NULL,
      lastname TEXT NOT NULL,
      licenseCategory TEXT NOT NULL
    );
  `);
}

export const insertCredential = async (
  jwt: string,
  dataModelId: string,
  issuer: string,
  issuanceDate: string,
  expirationDate: string,
  firstname: string,
  lastname: string,
  licenseCategory: string,
) => {
  await SQLiteDatabase.runAsync(
    `
    INSERT INTO credential (jwt, dataModelId, issuer, issuanceDate, expirationDate, firstname, lastname, licenseCategory) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `,
    jwt,
    dataModelId,
    issuer,
    issuanceDate,
    expirationDate,
    firstname,
    lastname,
    licenseCategory,
  );
};

export const getCredentials = async (): Promise<DBCredentials> => {
  return await SQLiteDatabase.getAllAsync(`SELECT * FROM credential`);
};

export const deleteCredentials = async () => {
  await SQLiteDatabase.runAsync('DELETE FROM credential');
};

export const deleteDatabase = async () => {
  const dbPath = `${FileSystem.documentDirectory}SQLite/iovf.db`;
  try {
    await FileSystem.deleteAsync(dbPath);
    console.log('Database deleted successfully');
  } catch (error) {
    console.error('Error deleting database:', error);
  }
};

export const checkIfCredentialExists = async (dataModelId: string) => {
  const result = await SQLiteDatabase.getAllAsync(
    'SELECT * FROM credential WHERE dataModelId = ?',
    dataModelId,
  );
  return result.length > 0;
};
