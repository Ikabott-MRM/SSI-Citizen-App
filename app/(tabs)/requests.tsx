import React, { useState } from 'react';
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { Text, useTheme } from 'react-native-paper';
import { List } from '@/components/List';
import * as SecureStore from 'expo-secure-store';
import { KEY_DID_SECURE_STORE } from '@/constants/secureStore';
import { useRequestsQuery } from '@/hooks/queries/useRequestsQuery';

const storedDid =
  Platform.OS !== 'web' ? SecureStore.getItem(KEY_DID_SECURE_STORE) || '' : '';

const CREDENTIAL_TYPES = {
  drivers_license: 'Licencia de Conducir',
};

const STATUS_CONFIG = {
  pending: {
    color: 'orange',
    text: 'PENDIENTE',
  },
  rejected: {
    color: 'red',
    text: 'RECHAZADO',
  },
  approved: {
    color: 'green',
    text: 'APROBADO',
  },
};

// Function to map credentials to the required format
const mapRequests = requests => {
  const dimensions = Dimensions.get('window');
  const imageHeight = Math.round((dimensions.width * 9) / 16);

  return requests.map((request, index) => ({
    id: request.id,
    title: `Solicitud ${index + 1} - ${CREDENTIAL_TYPES[request.schema_id]}`,
    content: (
      <View>
        <Text style={{ marginBottom: 10 }}>
          <View
            style={{
              backgroundColor: `${STATUS_CONFIG[request.status].color}`,
              paddingVertical: 3,
              paddingHorizontal: 7,
              borderRadius: 5,
            }}
          >
            <Text
              style={{
                color: 'white',
                fontSize: 16,
              }}
            >
              {STATUS_CONFIG[request.status].text}
            </Text>
          </View>
        </Text>
        <Image
          source={`https://identity-api.mangofield-2f4eea69.brazilsouth.azurecontainerapps.io/${request.document_url}`}
          style={{ height: imageHeight, width: '100%' }}
          transition={300}
        />
      </View>
    ),
  }));
};

export default function Credentials() {
  const theme = useTheme();
  const styles = stylesFnc({
    container: {
      backgroundColor: theme.colors.background.primary,
    },
  });
  const { requests, refetch } = useRequestsQuery(storedDid, {
    select: data => mapRequests(data),
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
        style={{ marginTop: 10 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.h1}>Tus Solicitudes</Text>
        {requests?.length === 0 && (
          <Text
            style={{
              color: theme.colors.typography.secondary,
              textAlign: 'center',
              fontSize: 18,
            }}
          >
            Actualmente no tienes ninguna solicitude.
          </Text>
        )}
        <List data={requests} />
      </ScrollView>
    </View>
  );
}

const stylesFnc = css =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: css.container.backgroundColor,
      paddingHorizontal: 20,
      paddingTop: 50,
      marginBottom: 0,
    },
    scrollView: {
      marginTop: 10,
      marginBottom: 0,
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
    h1: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#00d27d',
      textAlign: 'center',
      marginBottom: 20,
      fontFamily: 'Roboto',
    },
  });
