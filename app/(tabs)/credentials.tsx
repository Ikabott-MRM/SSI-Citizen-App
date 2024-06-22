import { Platform, ScrollView, StyleSheet, View, Dimensions, TouchableOpacity } from 'react-native';
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

const { width } = Dimensions.get('window');

// Componente de acordeón para mostrar/ocultar detalles
const Accordion = ({ title, children }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleAccordion = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={[styles.accordionContainer, { backgroundColor: isExpanded ? '#e1e1e1' : '#f2f2f2' }]}>
      <TouchableOpacity onPress={toggleAccordion}>
        <Text style={styles.accordionTitle}>{title}</Text>
      </TouchableOpacity>
      {isExpanded && <View>{children}</View>}
    </View>
  );
};

// Function to map credentials to the required format
const mapCredentials = (credentials: Credential[]) => {
  return credentials.map(credential => ({
    id: credential.verifiableCredential.vcDataModel.id,
    title: 'Licencia de Conducir',
    content: (
      <Accordion title="Licencia de Conducir">
        <View style={styles.credentialContainer}>
          <View style={styles.qrCodeContainer}>
            <QRCode size={150} value={credential.vcJwt} />
          </View>
          <Text style={styles.credentialText}>
            Emitida el{' '}
            {format(
              new Date(credential.verifiableCredential.vcDataModel.issuanceDate),
              'dd/MM/yyyy',
            )}
          </Text>
          <Text style={styles.credentialText}>
            Expira el{' '}
            {format(
              new Date(
                credential.verifiableCredential.vcDataModel.expirationDate,
              ),
              'dd/MM/yyyy',
            )}
          </Text>
        </View>
      </Accordion>
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
      <Stack.Screen options={{ headerTitle: 'Credentials' }} />
      <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.h1}>Tus Credenciales</Text></View>
        {credentials.map((credential, index) => (
          <View key={index}>{credential.content}</View>
        ))}
      </ScrollView>
      <FabWithMenu style={styles.fab} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 0,
  },
  scrollView: {
    marginTop: 10,
    marginBottom: 0,
  },
  credentialContainer: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 20,
    borderRadius: 0,
    marginBottom: 0,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    width: width - 32, // Span the width of the device with some margin
    alignSelf: 'center',
  },
  credentialTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333333',
    paddingHorizontal:5,
  },
  credentialText: {
    fontSize: 14,
    lineHeight: 24,
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'System',
    color: '#333333',
    textAlign: 'center',
  },
  qrCodeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  button: {
    marginTop: 20,
    width: 200,
    height: 50,
    justifyContent: 'center',
    alignSelf: 'center',
    borderRadius: 25,
    fontSize: 16,
    fontFamily: 'Roboto',
  },
  h1: {
    fontSize: 24, 
    fontWeight: 'bold',
    color: '#00d27d',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Roboto', 
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    fontFamily: 'Roboto',
    color: '#333',
  },
  accordionContainer: {
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
  accordionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 5,
  },
});
