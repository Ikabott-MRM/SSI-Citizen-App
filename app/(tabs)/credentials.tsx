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
  return credentials.map((credential) => ({
    id: credential.verifiableCredential.vcDataModel.id,
    title: (
      <View>
        <Text
          style={{
            color: '#fff',
            fontSize: 16,
            fontWeight: 'bold',
            textTransform: 'uppercase',
          }}
        >
          Licencia de Conducir
        </Text>
      </View>
    ),
    content: (
      <View style={styles.credentialContainer}>
        <View style={styles.qrCodeContainer}>
          <QRCode size={300} value={credential.vcJwt} />
        </View>
        {credential.verifiableCredential.vcDataModel.credentialSubject
          .firstname && (
          <Text style={styles.credentialText}>
            <Text style={styles.labelText}>Nombre: </Text>
            {
              credential.verifiableCredential.vcDataModel.credentialSubject
                .firstname
            }
          </Text>
        )}
        {credential.verifiableCredential.vcDataModel.credentialSubject
          .lastname && (
          <Text style={styles.credentialText}>
            <Text style={styles.labelText}>Apellido: </Text>
            {
              credential.verifiableCredential.vcDataModel.credentialSubject
                .lastname
            }
          </Text>
        )}
        {credential.verifiableCredential.vcDataModel.issuanceDate && (
          <Text style={styles.credentialText}>
            <Text style={styles.labelText}>Emitida el: </Text>
            {format(
              new Date(
                credential.verifiableCredential.vcDataModel.issuanceDate
              ),
              'dd/MM/yyyy'
            )}
          </Text>
        )}
        {credential.verifiableCredential.vcDataModel.expirationDate && (
          <Text style={styles.credentialText}>
            <Text style={styles.labelText}>Expira el: </Text>
            {format(
              new Date(
                credential.verifiableCredential.vcDataModel.expirationDate
              ),
              'dd/MM/yyyy'
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
        expirationDate
      );
    }
  }
};

const mapDatabaseCredentials = (
  dbCredentials: DBCredentials
): MappedCredential[] => {
  return dbCredentials.map((dbCredential) => ({
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
  const [openAccordionId, setOpenAccordionId] = useState(null);
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
          <View>
            <Text
              style={{
                color: theme.colors.typography.secondary,
                textAlign: 'center',
                fontSize: 18,
              }}
            >
              Actualmente no tienes ninguna credencial.
            </Text>
            <Text
              style={{
                color: theme.colors.typography.secondary,
                textAlign: 'center',
                fontSize: 18,
                marginTop: 15,
              }}
            >
              Solicita una nueva credencial utilizando el botón +.
            </Text>
          </View>
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
      marginTop: 0,
      paddingBottom: 20,
    },
    credentialTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 0,
      color: '#333333',
      paddingHorizontal: 5,
    },
    credentialText: {
      fontSize: 16,
      lineHeight: 24,
      fontFamily: Platform.OS === 'android' ? 'Roboto' : 'System',
      color: '#fff',
      textAlign: 'left',
      marginLeft: 5,
    },

    labelText: {
      fontWeight: 'bold',
      color: '#CCC',
    },

    qrCodeContainer: {
      backgroundColor: '#ccc',
      alignItems: 'center',
      paddingVertical: 5,
      paddingHorizontal: 5,
      marginBottom: 10,
      borderRadius: 5,
      marginTop: -25,
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
      textAlign: 'left',
      marginBottom: 20,
      paddingHorizontal: 20,
      fontFamily: 'Roboto',
      color: '#333',
    },
  });
