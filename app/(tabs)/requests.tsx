import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Text } from 'react-native-paper';
import { List } from '@/components/List';
import * as SecureStore from 'expo-secure-store';
import { KEY_DID_SECURE_STORE } from '@/constants/secureStore';
import { useRequestsQuery } from '@/hooks/queries/useRequestsQuery';

const storedDid =
  Platform.OS !== 'web' ? SecureStore.getItem(KEY_DID_SECURE_STORE) || '' : '';

const CREDENTIAL_TYPES = {
  drivers_license: 'Licencia de Conducir',
};

// Function to map credentials to the required format
const mapRequests = requests => {
  const dimensions = Dimensions.get('window');
  const imageHeight = Math.round((dimensions.width * 9) / 16);
  const imageWidth = dimensions.width;

  return requests.map((request, index) => ({
    id: request.id,
    title: `Solicitud ${index + 1} - ${CREDENTIAL_TYPES[request.schema_id]}`,
    content: (
      <View>
        <Text style={{ marginBottom: 10 }}>
          <View
            style={{
              backgroundColor: `${request.status === 'approved' ? 'green' : 'red'}`,
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
              {request.status.toUpperCase()}
            </Text>
          </View>
        </Text>
        <Image
          source={`https://identity-api.mangofield-2f4eea69.brazilsouth.azurecontainerapps.io/${request.document_url}`}
          style={{ height: imageHeight, width: imageWidth }}
          transition={300}
        />
      </View>
    ),
  }));
};

export default function Credentials() {
  const { requests, isPending } = useRequestsQuery(storedDid, {
    select: data => mapRequests(data),
  });

  return (
    <View style={styles.container}>
      <ScrollView style={{ marginTop: 10 }}>
        <Text style={styles.h1}>Tus Solicitudes</Text>
        <List data={requests} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
