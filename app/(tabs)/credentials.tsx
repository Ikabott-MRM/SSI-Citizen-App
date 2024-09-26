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
import { KEY_DID_SECURE_STORE } from '@/constants/secureStore';
import Toast from 'react-native-root-toast';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { useSecureStore } from '../../providers/SecureStoreProvider';

interface Styles {
  credentialContainer: ViewStyle;
  qrCodeContainer: ViewStyle;
  credentialText: TextStyle;
  labelText: TextStyle;
}

// Function to map credentials to the required format
const mapCredentials = (
  credentials: Credential[],
  styles: Styles,
  t: TFunction<'translation', undefined>,
) => {
  return credentials.map(credential => ({
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
          {t('Driver license')}
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
            <Text style={styles.labelText}>{t('Name')}: </Text>
            {
              credential.verifiableCredential.vcDataModel.credentialSubject
                .firstname
            }
          </Text>
        )}
        {credential.verifiableCredential.vcDataModel.credentialSubject
          .lastname && (
          <Text style={styles.credentialText}>
            <Text style={styles.labelText}>{t('Last name')}: </Text>
            {
              credential.verifiableCredential.vcDataModel.credentialSubject
                .lastname
            }
          </Text>
        )}
        {credential.verifiableCredential.vcDataModel.credentialSubject
          .licenseCategory && (
          <Text style={styles.credentialText}>
            <Text style={styles.labelText}>{t('Category')}: </Text>
            {
              credential.verifiableCredential.vcDataModel.credentialSubject
                .licenseCategory
            }
          </Text>
        )}
        {credential.verifiableCredential.vcDataModel.issuanceDate && (
          <Text style={styles.credentialText}>
            <Text style={styles.labelText}>{t('Issued on')}: </Text>
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
            <Text style={styles.labelText}>{t('Expires on')}: </Text>
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
  const { t } = useTranslation();
  const theme = useTheme<CustomTheme>();
  const [storedDid, setStoredDid] = useState<string | null>(null);

  const isConnected = useNetInfo();
  const [credentials, setCredentials] = useState<IList[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const styles = stylesFnc({
    container: {
      backgroundColor: theme.customColors.background.primary,
    },
  });

  const secureStoreInstance = useSecureStore();

  useEffect(() => {
    const fetchDid = async () => {
      if (secureStoreInstance) {
        const did = await secureStoreInstance.getItem(KEY_DID_SECURE_STORE);
        setStoredDid(did);
      }
    };

    fetchDid();
  }, [secureStoreInstance]);

  const fetchData = async () => {
    let data;

    try {
      if (isConnected && storedDid) {
        data = await credential.getCredentials(storedDid);
        await insertCredentials(data);
      } else {
        const dbData = await getCredentials();
        data = mapDatabaseCredentials(dbData);
      }

      if (data) {
        // @ts-expect-error
        const mappedData = mapCredentials(data, styles, t);
        setCredentials(mappedData);
      }
    } catch (error) {
      if (error && typeof error === 'string') {
        Toast.show(error as string, {
          duration: Toast.durations.LONG,
          position: Toast.positions.BOTTOM,
        });
      }
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
            <Text style={styles.h1}>{t('Your credentials')}</Text>
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
              {t('You currently do not have any credentials')}
            </Text>
            <Text
              style={{
                color: theme.customColors.typography.secondary,
                textAlign: 'center',
                fontSize: 18,
                marginTop: 15,
              }}
            >
              {t('Request a new credential using the + button')}
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
