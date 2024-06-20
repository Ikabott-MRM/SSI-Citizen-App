import * as SQLite from 'expo-sqlite';

export const SQLiteDatabase = SQLite.openDatabaseSync('iovf.db');

type DBCredential = {
  id: number;
  jwt: string;
  dataModelId: string;
  issuer: string;
  issuanceDate: string;
  expirationDate: string;
};

export type MappedCredential = {
  verifiableCredential: {
    vcDataModel: {
      id: string;
      issuanceDate: string;
      expirationDate: string;
      issuer: string;
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
      expirationDate TEXT NOT NULL
    );
  `);
}

export const insertCredential = async (
  jwt: string,
  dataModelId: string,
  issuer: string,
  issuanceDate: string,
  expirationDate: string,
) => {
  await SQLiteDatabase.runAsync(
    `
    INSERT INTO credential (jwt, dataModelId, issuer, issuanceDate, expirationDate) VALUES (?, ?, ?, ?, ?)
  `,
    jwt,
    dataModelId,
    issuer,
    issuanceDate,
    expirationDate,
  );
};

export const getCredentials = async (): Promise<DBCredentials> => {
  return await SQLiteDatabase.getAllAsync(`SELECT * FROM credential`);
};

export const deleteCredentials = async (): Promise<DBCredentials> => {
  return await SQLiteDatabase.getAllAsync('DELETE FROM credential');
};
