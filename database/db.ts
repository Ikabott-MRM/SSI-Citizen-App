import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';

async function getDBConnection() {
  return await SQLite.openDatabaseAsync('iovf.db');
}

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
  const db = await getDBConnection();
  try {
    await db.execAsync(`
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
  } catch (err) {
    console.log('Error creating table', err);
  }
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
  const db = await getDBConnection();
  try {
    await db.runAsync(
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
  } catch (err) {
    console.log('Error inserting table', err);
  }
};

export const getCredentials = async (): Promise<DBCredentials> => {
  const db = await getDBConnection();
  try {
    return await db.getAllAsync(`SELECT * FROM credential`);
  } catch (err) {
    console.log('Error getting credential', err);
  }

  return [];
};

export const deleteCredentials = async () => {
  const db = await getDBConnection();
  try {
    await db.runAsync('DELETE FROM credential');
  } catch (err) {
    console.log('Error deleting credential', err);
  }
};

export const deleteDatabase = async () => {
  const dbPath = `${FileSystem.documentDirectory}SQLite/iovf.db`;
  try {
    const db = await getDBConnection();
    await db.closeAsync();
    await FileSystem.deleteAsync(dbPath);
    console.log('Database deleted successfully');
  } catch (error) {
    console.error('Error deleting database:', error);
  }
};

export const checkIfCredentialExists = async (dataModelId: string) => {
  const db = await getDBConnection();
  const result = await db.getAllAsync(
    'SELECT * FROM credential WHERE dataModelId = ?',
    dataModelId,
  );
  return result.length > 0;
};
