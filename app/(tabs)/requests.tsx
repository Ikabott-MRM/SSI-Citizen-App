import React, { useState } from 'react';
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

const CREDENTIAL_TYPES: { [key in Request['schema_id']]: string } = {
  drivers_license: 'Licencia de Conducir',
};
const STATUS_CONFIG: {
  [key in Request['status']]: { color: string; text: string };
} = {
  pending: { color: 'orange', text: 'PENDIENTE' },
  rejected: { color: 'red', text: 'NO APROBADO' },
  approved: { color: 'green', text: 'APROBADO' },
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
const mapRequests = (requests: Request[], styles: Styles) => {
  const dimensions = Dimensions.get('window');
  const imageHeight = Math.round((dimensions.width * 9) / 16);

  return requests.map(request => ({
    id: request.id,
    title: (
      <View style={styles.requestTitleContainer}>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: STATUS_CONFIG[request.status].color },
          ]}
        />
        <Text style={styles.requestTitleText}>Solicitud #{request.code}</Text>
      </View>
    ),
    content: (
      <View style={styles.requestContentContainer}>
        <Text style={styles.credentialTypeLabel}>
          Tipo de Credencial Solicitada
        </Text>
        <Text style={styles.credentialType}>
          {CREDENTIAL_TYPES[request.schema_id]}
        </Text>
        <Text style={styles.statusLabel}>Estado</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: STATUS_CONFIG[request.status].color },
          ]}
        >
          <Text style={styles.statusText}>
            {STATUS_CONFIG[request.status].text}
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
  const storedDid =
    Platform.OS !== 'web'
      ? SecureStore.getItem(KEY_DID_SECURE_STORE) || ''
      : '';

  const theme = useTheme<CustomTheme>();
  const styles = stylesFnc(theme.customColors);
  const { requests, refetch } = useRequestsQuery(storedDid, {
    select: (data: Request[]) => mapRequests(data, styles),
  });
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
        {storedDid && (
          <View style={styles.container}>
            <Text style={styles.h1}>Tus Solicitudes</Text>
          </View>
        )}
        {requests?.length === 0 && storedDid && (
          <Text style={styles.noRequestText}>
            Actualmente no tienes ninguna solicitud.
          </Text>
        )}
        {storedDid && <List data={requests} />}
        {!storedDid && <NoDID />}
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
