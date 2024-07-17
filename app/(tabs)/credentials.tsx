import {
  Platform,
  ScrollView,
  StyleSheet,
  View,
  RefreshControl,
  TextStyle,
  ViewStyle,
} from 'react-native';
import QRCode from 'react-qr-code';
import { Text, useTheme } from 'react-native-paper';
import FabWithMenu from '@/components/FabWithMenu';
import { Stack } from 'expo-router';
import { Credential } from '@/@types/credential';
import { format } from 'date-fns';
import { useNetInfo } from '@/hooks/useNetInfo';
import { useEffect, useState } from 'react';
import {
  checkIfCredentialExists,
  DBCredentials,
  getCredentials,
  insertCredential,
  MappedCredential,
} from '@/database/db';
import credential from '@/services/credential';
import { IList, List } from '@/components/List';
import { CustomTheme } from '@/@types/theme';
import { NoDID } from '@/components/NoDID';
import * as SecureStore from 'expo-secure-store';
import { KEY_DID_SECURE_STORE } from '@/constants/secureStore';
import Toast from 'react-native-root-toast';

interface Styles {
  credentialContainer: ViewStyle;
  qrCodeContainer: ViewStyle;
  credentialText: TextStyle;
  labelText: TextStyle;
}

// Function to map credentials to the required format
const mapCredentials = (credentials: Credential[], styles: Styles) => {
  return credentials?.map(credential => ({
    id: credential.verifiableCredential.vcDataModel.id,
    title: (
      <View>
        <Text
          style={{
            color: '#CCC',
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
        {credential.verifiableCredential.vcDataModel.credentialSubject
          .licenseCategory && (
          <Text style={styles.credentialText}>
            <Text style={styles.labelText}>Categoría: </Text>
            {
              credential.verifiableCredential.vcDataModel.credentialSubject
                .licenseCategory
            }
          </Text>
        )}
        {credential.verifiableCredential.vcDataModel.issuanceDate && (
          <Text style={styles.credentialText}>
            <Text style={styles.labelText}>Emitida el: </Text>
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
            <Text style={styles.labelText}>Expira el: </Text>
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
  if (!credentials?.length) return;

  for (const cred of credentials) {
    const exists = await checkIfCredentialExists(
      cred.verifiableCredential.vcDataModel.id,
    );

    if (!exists) {
      const {
        id,
        issuer,
        expirationDate,
        issuanceDate,
        credentialSubject: { firstname, lastname, licenseCategory },
      } = cred.verifiableCredential.vcDataModel;

      if (
        (cred.vcJwt,
        id,
        issuer,
        issuanceDate,
        expirationDate,
        firstname,
        lastname,
        licenseCategory)
      ) {
        await insertCredential(
          cred.vcJwt,
          id,
          issuer,
          issuanceDate,
          expirationDate,
          firstname,
          lastname,
          licenseCategory,
        );
      }
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
        credentialSubject: {
          firstname: dbCredential.firstname,
          lastname: dbCredential.lastname,
          licenseCategory: dbCredential.licenseCategory,
        },
      },
    },
    vcJwt: dbCredential.jwt,
  }));
};

export default function Credentials() {
  const theme = useTheme<CustomTheme>();
  const storedDid =
    Platform.OS !== 'web' ? SecureStore.getItem(KEY_DID_SECURE_STORE) : '';

  const isConnected = useNetInfo();
  const [credentials, setCredentials] = useState<IList[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const styles = stylesFnc({
    container: {
      backgroundColor: theme.customColors.background.primary,
    },
  });

  const fetchData = async () => {
    try {
      let data;

      if (isConnected && storedDid) {
        try {
          data = await credential.getCredentials(storedDid);
          await insertCredentials(data);
        } catch (err) {
          Toast.show(err as string, {
            duration: Toast.durations.LONG,
            position: Toast.positions.BOTTOM,
          });
        }
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
        {storedDid && (
          <View style={styles.container}>
            <Text style={styles.h1}>Tus Credenciales</Text>
          </View>
        )}
        {credentials?.length === 0 && storedDid && (
          <View>
            <Text
              style={{
                color: theme.customColors.typography.secondary,
                textAlign: 'center',
                fontSize: 18,
              }}
            >
              Actualmente no tienes ninguna credencial.
            </Text>
            <Text
              style={{
                color: theme.customColors.typography.secondary,
                textAlign: 'center',
                fontSize: 18,
                marginTop: 15,
              }}
            >
              Solicita una nueva credencial utilizando el botón +.
            </Text>
          </View>
        )}
        {storedDid && <List data={credentials} />}
        {!storedDid && <NoDID />}
      </ScrollView>
      {storedDid && <FabWithMenu />}
    </View>
  );
}

const stylesFnc = (css: { container: { backgroundColor: string } }) =>
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
