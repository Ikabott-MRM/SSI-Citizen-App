import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import QRCode from 'react-qr-code';
import { Text } from 'react-native-paper';
import FabWithMenu from '@/components/FabWithMenu';
import { Stack } from 'expo-router';
import { List } from '@/components/List';
import * as SecureStore from 'expo-secure-store';
import { KEY_DID_SECURE_STORE } from '@/constants/secureStore';
import { Credential } from '@/@types/credential';
import { format } from 'date-fns';
import { useNetInfo } from '@/hooks/useNetInfo';
import { useEffect, useState } from 'react';
import {
  DBCredentials,
  getCredentials,
  insertCredential,
  MappedCredential,
} from '@/database/db';
import credential from '@/services/credential';

const storedDid =
  Platform.OS !== 'web' ? SecureStore.getItem(KEY_DID_SECURE_STORE) : '';

// Function to map credentials to the required format
const mapCredentials = (credentials: Credential[]) => {
  return credentials.map(credential => ({
    id: credential.verifiableCredential.vcDataModel.id,
    title: 'Licencia de Conducir',
    content: (
      <View>
        <Text variant="bodyLarge">
          Nombre:{' '}
          {
            credential.verifiableCredential.vcDataModel.credentialSubject
              .firstname
          }
        </Text>
        <Text variant="bodyLarge">
          Apellido:{' '}
          {
            credential.verifiableCredential.vcDataModel.credentialSubject
              .lastname
          }
        </Text>
        <Text variant="bodyLarge">
          Fecha de emisión:{' '}
          {format(
            new Date(credential.verifiableCredential.vcDataModel.issuanceDate),
            'dd/MM/yyyy',
          )}
        </Text>
        <Text variant="bodyLarge">
          Fecha de vencimiento:{' '}
          {format(
            new Date(
              credential.verifiableCredential.vcDataModel.expirationDate,
            ),
            'dd/MM/yyyy',
          )}
        </Text>
        <QRCode size={200} value={credential.vcJwt} />
      </View>
    ),
  }));
};

// Function to insert credentials
const insertCredentials = async (credentials: Credential[]) => {
  for (const cred of credentials) {
    const { id, issuer, expirationDate, issuanceDate } =
      cred.verifiableCredential.vcDataModel;
    await insertCredential(
      cred.vcJwt,
      id,
      issuer,
      issuanceDate,
      expirationDate,
    );
  }
};

const mapDatabaseCredentials = (
  dbCredentials: DBCredentials,
): MappedCredential[] => {
  return dbCredentials.map(dbCredential => ({
    verifiableCredential: {
      vcDataModel: {
        id: dbCredential.dataModelId,
        issuanceDate: dbCredential.issuanceDate,
        expirationDate: dbCredential.expirationDate,
        issuer: dbCredential.issuer,
      },
    },
    vcJwt: dbCredential.jwt,
  }));
};

export default function Credentials() {
  const isConnected = useNetInfo();
  const [credentials, setCredentials] = useState<object[]>([]);

  const fetchData = async () => {
    try {
      let data;
      if (isConnected && storedDid) {
        data = await credential.getCredentials(storedDid);
        await insertCredentials(data);
      } else {
        const dbData = await getCredentials();
        data = mapDatabaseCredentials(dbData);
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const mappedData = mapCredentials(data);

      setCredentials(mappedData);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isConnected]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerTitle: 'Credenciales' }} />
      <FabWithMenu />
      <ScrollView style={{ marginTop: 10 }}>
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/*@ts-expect-error*/}
        <List data={credentials} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginTop: 30,
  },
  optionsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
  },
});
