import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  RefreshControl,
  Text,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Image, ImageStyle } from 'expo-image';
import { useTheme } from 'react-native-paper';
import { List } from '@/components/List';
import * as SecureStore from 'expo-secure-store';
import { KEY_DID_SECURE_STORE } from '@/constants/secureStore';
import { useRequestsQuery } from '@/hooks/queries/useRequestsQuery';
import { NoDID } from '@/components/NoDID';
import { CustomTheme } from '@/@types/theme';
import Toast from 'react-native-root-toast';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { getSecureMMKVInstance, SecureMMKV } from '../../services/secure-store';
import { useSecureStore } from '@/providers/SecureStoreProvider';

const getCredentialTypes = (
  t: (key: string) => string,
): { [key in Request['schema_id']]: string } => {
  return {
    drivers_license: t('Driver license'),
  };
};

const getStatusConfig = (
  t: (key: string) => string,
): {
  [key in Request['status']]: { color: string; text: string };
} => {
  return {
    pending: { color: 'orange', text: t('Pending') },
    rejected: { color: 'red', text: t('Rejected') },
    approved: { color: 'green', text: t('Approved') },
  };
};

interface Request {
  id: string;
  code: string;
  status: string;
  schema_id: string;
  document_url: string;
}

interface Styles {
  requestTitleContainer: ViewStyle;
  statusDot: ViewStyle;
  requestTitleText: TextStyle;
  requestContentContainer: ViewStyle;
  credentialTypeLabel: TextStyle;
  credentialType: TextStyle;
  statusLabel: TextStyle;
  statusBadge: ViewStyle;
  statusText: TextStyle;
  documentImageContainer: ViewStyle;
  documentImage: ImageStyle;
}

// Function to map credentials to the required format
const mapRequests = (
  requests: Request[],
  styles: Styles,
  t: TFunction<'translation', undefined>,
) => {
  const dimensions = Dimensions.get('window');
  const imageHeight = Math.round((dimensions.width * 9) / 16);

  return requests.map(request => ({
    id: request.id,
    title: (
      <View style={styles.requestTitleContainer}>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: getStatusConfig(t)[request.status].color },
          ]}
        />
        <Text style={styles.requestTitleText}>
          {t('Request')} #{request.code}
        </Text>
      </View>
    ),
    content: (
      <View style={styles.requestContentContainer}>
        <Text style={styles.credentialTypeLabel}>
          {t('Type of credential requested')}
        </Text>
        <Text style={styles.credentialType}>
          {getCredentialTypes(t)[request.schema_id]}
        </Text>
        <Text style={styles.statusLabel}>{t('Status')}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusConfig(t)[request.status].color },
          ]}
        >
          <Text style={styles.statusText}>
            {getStatusConfig(t)[request.status].text}
          </Text>
        </View>
        <View style={styles.documentImageContainer}>
          <Image
            source={`https://identity-api.mangofield-2f4eea69.brazilsouth.azurecontainerapps.io/${request.document_url}`}
            style={[styles.documentImage, { height: imageHeight }]}
            transition={300}
          />
        </View>
      </View>
    ),
  }));
};

export default function Credentials() {
  const { t } = useTranslation();
  const theme = useTheme<CustomTheme>();
  const styles = stylesFnc(theme.customColors);
  const [did, setDid] = useState<string | null>(null);
  const [secureStore, setSecureStore] = useState<SecureMMKV | null>(null);
  const { requests, refetch, error } = useRequestsQuery(did || '', {
    select: (data: Request[]) => mapRequests(data, styles, t),
  });
  const secureStoreInstance = useSecureStore();
  
  useEffect(() => {
    const fetchStoredDid = async () => {
      // const secureStoreInstance = useSecureStore();
      if (secureStoreInstance && Platform.OS !== 'web') {
        const storedDid = secureStoreInstance.getItem(KEY_DID_SECURE_STORE);
        setDid(storedDid);
      }
    };
  
    fetchStoredDid();
  }, []);

  useEffect(() => {
    if (error && typeof error === 'string') {
      Toast.show(error, {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
      });
    }
  }, [error]);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {did && (
          <View style={styles.container}>
            <Text style={styles.h1}>{t('Your requests')}</Text>
          </View>
        )}
        {requests?.length === 0 && did && (
          <Text style={styles.noRequestText}>
            {t('You currently have no requests')}
          </Text>
        )}
        {did && <List data={requests} />}
        {!did && <NoDID />}
      </ScrollView>
    </View>
  );
}

const stylesFnc = (colors: {
  background: { primary: string };
  typography: { secondary: string };
}) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
      paddingHorizontal: 20,
      paddingTop: 25,
    },
    scrollView: {
      marginTop: 10,
    },
    h1: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#00ff85',
      textAlign: 'center',
      marginBottom: 20,
    },
    noRequestText: {
      color: colors.typography.secondary,
      textAlign: 'center',
      fontSize: 18,
    },
    requestTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statusDot: {
      height: 10,
      width: 10,
      borderRadius: 5,
      marginRight: 5,
    },
    requestTitleText: {
      color: '#CCC',
      fontSize: 16,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      lineHeight: 20,
      alignSelf: 'center',
    },
    requestContentContainer: {
      marginBottom: 15,
    },
    credentialTypeLabel: {
      marginBottom: 5,
      color: '#D9D8D9',
      fontSize: 14,
      fontWeight: 'bold',
    },
    credentialType: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 15,
    },
    statusLabel: {
      marginBottom: 5,
      color: '#D9D8D9',
      fontSize: 14,
      fontWeight: 'bold',
    },
    statusBadge: {
      paddingVertical: 3,
      paddingHorizontal: 7,
      borderRadius: 5,
      alignSelf: 'flex-start',
      marginBottom: 15,
    },
    statusText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
      textTransform: 'uppercase',
    },
    documentImageContainer: {
      borderWidth: 4,
      borderColor: '#ccc',
      borderRadius: 10,
    },
    documentImage: {
      width: '100%',
    },
  });
