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
import { enUS } from 'date-fns/locale/en-US';
import { es as esLocale } from 'date-fns/locale/es';
import type { Locale } from 'date-fns';
import { useNetInfo } from '@/hooks/useNetInfo';
import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
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
import Toast from 'react-native-root-toast';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { useDid } from '../../providers/DidProvider';

interface Styles {
  credentialContainer: ViewStyle;
  qrCodeContainer: ViewStyle;
  credentialText: TextStyle;
  labelText: TextStyle;
}

const isProductionRegistryCredential = (type: string[] = []) =>
  type.some(
    item =>
      typeof item === 'string' &&
      item.toLowerCase().includes('productionregistry'),
  );

const getCredentialTitle = (
  type: string[] = [],
  t: TFunction<'translation', undefined>,
) => {
  const joined = type.join(' ').toLowerCase();
  if (joined.includes('donor')) return t('Donor');
  if (joined.includes('fundraiser')) return t('Fundraiser');
  if (joined.includes('associate')) return t('Associate');
  if (joined.includes('productionregistry') || joined.includes('production_registry'))
    return t('Production registry');
  if (joined.includes('driverslicense') || joined.includes('drivers_license'))
    return t('Driver license');
  return t('Credential');
};

// Function to map credentials to the required format
const mapCredentials = (
  credentials: Credential[],
  styles: Styles,
  t: TFunction<'translation', undefined>,
  dateLocale: Locale,
) => {
  return credentials.map(credential => ({
    id: credential.verifiableCredential.vcDataModel.id,
    title: (
      <View>
        <Text
          style={{
            color: '#21201C',
            fontSize: 16,
            fontWeight: 'bold',
            textTransform: 'uppercase',
          }}
        >
          {getCredentialTitle(
            credential.verifiableCredential.vcDataModel.type,
            t,
          )}
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
          .projectName && (
          <Text style={styles.credentialText}>
            <Text style={styles.labelText}>{t('Project name')}: </Text>
            {
              credential.verifiableCredential.vcDataModel.credentialSubject
                .projectName
            }
          </Text>
        )}
        {credential.verifiableCredential.vcDataModel.credentialSubject.role && (
          <Text style={styles.credentialText}>
            <Text style={styles.labelText}>{t('Role')}: </Text>
            {credential.verifiableCredential.vcDataModel.credentialSubject.role}
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
        {credential.verifiableCredential.vcDataModel.credentialSubject.tipo && (
          <Text style={styles.credentialText}>
            <Text style={styles.labelText}>{t('Type')}: </Text>
            {credential.verifiableCredential.vcDataModel.credentialSubject.tipo}
          </Text>
        )}
        {credential.verifiableCredential.vcDataModel.credentialSubject
          .cantidad && (
          <Text style={styles.credentialText}>
            <Text style={styles.labelText}>{t('Quantity')}: </Text>
            {
              credential.verifiableCredential.vcDataModel.credentialSubject
                .cantidad
            }
          </Text>
        )}
        {credential.verifiableCredential.vcDataModel.credentialSubject.precio && (
          <Text style={styles.credentialText}>
            <Text style={styles.labelText}>{t('Price')}: </Text>
            {credential.verifiableCredential.vcDataModel.credentialSubject.precio}
          </Text>
        )}
        {credential.verifiableCredential.vcDataModel.credentialSubject
          .fechaEntrega && (
          <Text style={styles.credentialText}>
            <Text style={styles.labelText}>{t('Delivery date')}: </Text>
            {format(
              new Date(
                credential.verifiableCredential.vcDataModel.credentialSubject
                  .fechaEntrega,
              ),
              'P',
              { locale: dateLocale },
            )}
          </Text>
        )}
        {credential.verifiableCredential.vcDataModel.issuanceDate && (
          <Text style={styles.credentialText}>
            <Text style={styles.labelText}>{t('Issued on')}: </Text>
            {format(
              new Date(
                credential.verifiableCredential.vcDataModel.issuanceDate,
              ),
              'P',
              { locale: dateLocale },
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
              'P',
              { locale: dateLocale },
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
      const model = cred.verifiableCredential?.vcDataModel;
      if (!model) continue;
      const {
        id,
        issuer,
        expirationDate,
        issuanceDate,
        type,
      } = model;
      const subject = model.credentialSubject ?? {};
      const firstname = subject.firstname;
      const lastname = subject.lastname;
      const licenseCategory = subject.licenseCategory;

      if (isProductionRegistryCredential(type ?? [])) {
        continue;
      }

      if (
        cred.vcJwt &&
        id &&
        issuer &&
        issuanceDate &&
        expirationDate &&
        firstname &&
        lastname &&
        licenseCategory
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
        type: ['https://identity-iovf.xyz/schemas/driversLicense'],
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
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'es' ? esLocale : enUS;
  const theme = useTheme<CustomTheme>();
  const { didUri } = useDid();

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
      if (!didUri) {
        setCredentials([]);
        return;
      }

      // Never fall back to unscoped SQLite: those rows are not keyed by DID and
      // can show another identity's VCs (e.g. Rocky after switching to Elpe).
      if (!isConnected) {
        setCredentials([]);
        Toast.show(t('An error occurred loading credentials'), {
          duration: Toast.durations.SHORT,
          position: Toast.positions.BOTTOM,
        });
        return;
      }

      const fetched = await credential.getCredentials(didUri);
      const data: Credential[] = Array.isArray(fetched) ? fetched : [];
      if (data.length) {
        await insertCredentials(data);
      }

      // Always replace the list (null/empty must not keep a previous DID's VCs).
      // @ts-expect-error
      setCredentials(mapCredentials(data, styles, t, dateLocale));
    } catch (error) {
      setCredentials([]);
      const message =
        typeof error === 'string'
          ? error
          : error instanceof Error
            ? error.message
            : t('An error occurred loading credentials');
      Toast.show(message, {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
      });
    }
  };

  useEffect(() => {
    setCredentials([]);
    void fetchData();
  }, [didUri, isConnected, i18n.language]);

  useFocusEffect(
    useCallback(() => {
      void fetchData();
    }, [didUri, isConnected, i18n.language]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerTitle: t('Credentials') }} />
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {didUri && (
          <View style={styles.container}>
            <Text style={styles.h1}>{t('Your credentials')}</Text>
            <Text
              style={{
                color: theme.customColors.typography.secondary,
                textAlign: 'center',
                fontSize: 12,
                marginBottom: 12,
              }}
            >
              DID …{didUri.slice(-12)}
            </Text>
          </View>
        )}
        {credentials?.length === 0 && didUri && (
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
        {didUri && <List data={credentials} />}
        {!didUri && <NoDID />}
      </ScrollView>
      {didUri && <FabWithMenu />}
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
      backgroundColor: '#F5F7F7',
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
      color: '#21201C',
      textAlign: 'left',
      marginLeft: 5,
    },

    labelText: {
      fontWeight: 'bold',
      color: '#4A4A4A',
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
      color: '#00F5DC',
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
