import {
  Platform,
  ScrollView,
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import QRCode from 'react-qr-code';
import { Text, useTheme } from 'react-native-paper';
import FabWithMenu from '@/components/FabWithMenu';
import { Stack } from 'expo-router';
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
import { IList, List } from '@/components/List';

const storedDid =
  Platform.OS !== 'web' ? SecureStore.getItem(KEY_DID_SECURE_STORE) : '';

const { width } = Dimensions.get('window');

// Function to map credentials to the required format
const mapCredentials = (credentials: Credential[], styles) => {
  return credentials.map(credential => ({
    id: credential.verifiableCredential.vcDataModel.id,
    title: 'Licencia de Conducir',
    content: (
      <View style={styles.credentialContainer}>
        <View style={styles.qrCodeContainer}>
          <QRCode size={300} value={credential.vcJwt} />
        </View>
        {credential.verifiableCredential.vcDataModel.credentialSubject
          .firstname && (
          <Text style={styles.credentialText}>
            Nombre:{' '}
            {
              credential.verifiableCredential.vcDataModel.credentialSubject
                .firstname
            }
          </Text>
        )}
        {credential.verifiableCredential.vcDataModel.credentialSubject
          .lastname && (
          <Text style={styles.credentialText}>
            Apellido:{' '}
            {
              credential.verifiableCredential.vcDataModel.credentialSubject
                .lastname
            }
          </Text>
        )}
        {credential.verifiableCredential.vcDataModel.issuanceDate && (
          <Text style={styles.credentialText}>
            Emitida el{' '}
            {format(
              new Date(
                credential.verifiableCredential.vcDataModel.issuanceDate,
              ),
              'dd/MM/yyyy',
            )}
          </Text>
        )}
        {credential.verifiableCredential.vcDataModel.expirationDate && (
          <Text style={styles.credentialText}>
            Expira el{' '}
            {format(
              new Date(
                credential.verifiableCredential.vcDataModel.expirationDate,
              ),
              'dd/MM/yyyy',
            )}
          </Text>
        )}
      </View>
    ),
  }));
};

// Function to insert credentials
const insertCredentials = async (credentials: Credential[]) => {
  for (const cred of credentials) {
    const { id, issuer, expirationDate, issuanceDate } =
      cred.verifiableCredential.vcDataModel;

    if ((cred.vcJwt, id, issuer, issuanceDate, expirationDate)) {
      await insertCredential(
        cred.vcJwt,
        id,
        issuer,
        expirationDate,
        expirationDate,
      );
    }
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
  const theme = useTheme();
  const isConnected = useNetInfo();
  const [credentials, setCredentials] = useState<IList[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const styles = stylesFnc({
    container: {
      backgroundColor: theme.colors.background.primary,
    },
  });

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
      const mappedData = mapCredentials(data, styles);

      setCredentials(mappedData);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isConnected]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerTitle: 'Credentials' }} />
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.container}>
          <Text style={styles.h1}>Tus Credenciales</Text>
        </View>
        {credentials.length === 0 && (
          <Text
            style={{
              color: theme.colors.typography.secondary,
              textAlign: 'center',
              fontSize: 18,
            }}
          >
            Actualmente no tienes ninguna credencial, solicitá una nueva
            utilizando el botón '+'.
          </Text>
        )}
        <List data={credentials} />
      </ScrollView>
      <FabWithMenu />
    </View>
  );
}

const stylesFnc = (css: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: css.container.backgroundColor,
      paddingHorizontal: 20,
      paddingTop: 25,
      marginBottom: 0,
    },
    scrollView: {
      marginTop: 10,
      marginBottom: 0,
    },
    credentialContainer: {
      backgroundColor: '#444',
    },
    credentialTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
      color: '#333333',
      paddingHorizontal: 5,
    },
    credentialText: {
      fontSize: 18,
      lineHeight: 24,
      fontFamily: Platform.OS === 'android' ? 'Roboto' : 'System',
      color: '#CCC',
      textAlign: 'center',
    },
    qrCodeContainer: {
      backgroundColor: '#f5f5f5',
      alignItems: 'center',
      paddingVertical: 30,
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
      color:'#444',
    },
    h1: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#00ff85',
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
      marginBottom: 10,
      backgroundColor: '#f9f9f9',
      borderRadius: 5,
    },
    accordionTitle: {
      fontSize: 18,
      color: '#CCC',
      paddingVertical: 10,
      paddingHorizontal: 15,
      marginBottom: 5,
    },
  });
