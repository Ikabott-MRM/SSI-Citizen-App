import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { ActivityIndicator, Button, Text, useTheme } from 'react-native-paper';
import { Stack } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Colors } from '@/constants/Colors';
import { useIdentityMutation } from '@/hooks/mutations/useIdentityMutation';
import * as SecureStore from 'expo-secure-store';
import { KEY_DID_SECURE_STORE } from '@/constants/secureStore';
import Toast from 'react-native-root-toast';
import { useQueryClient } from '@tanstack/react-query';
import { REQUESTS_QUERY_KEYS } from '@/constants/queryKeys/requests';

export default function Identity() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const theme = useTheme();
  const [image, setImage] = useState<string | null>(null);
  const { uploadDocumentFile, isPending } = useIdentityMutation();
  const did =
    Platform.OS !== 'web' ? SecureStore.getItem(KEY_DID_SECURE_STORE) : '';

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = () => {
    const formData = new FormData();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    formData.append('file', {
      uri: image,
      type: 'image/jpeg',
      name: 'document-image',
    });

    if (formData && did) {
      uploadDocumentFile(
        {
          did,
          formData,
        },
        {
          onSuccess: () => {
            Toast.show('Credencial solicitada exitosamente', {
              duration: Toast.durations.LONG,
              position: Toast.positions.BOTTOM,
            });
            queryClient
              .invalidateQueries({
                queryKey: [REQUESTS_QUERY_KEYS.GET_REQUESTS],
                refetchType: 'all',
              })
              .then(() => {
                console.log('dale');
                router.navigate('/requests');
                setImage(null);
              });
          },
          onError: (error: string | Error) => {
            if (typeof error === 'string') {
              Toast.show(error, {
                duration: Toast.durations.LONG,
                position: Toast.positions.BOTTOM,
              });
            }
          },
        },
      );
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Presentación de Identidad',
          headerBackTitle: '',
        }}
      />
      {!image && did && (
        <TouchableOpacity onPress={pickImage}>
          <View style={styles.containerUpload}>
            <Ionicons
              name="cloud-upload"
              size={240}
              color={theme.colors.primary}
            />
            <Button style={styles.button} mode="contained">
              Cargar Imagen
            </Button>
          </View>
        </TouchableOpacity>
      )}
      {image && !isPending && did && (
        <View>
          <Text style={styles.text} variant="titleLarge">
            ¿Desea confirmar la imagen seleccionada?
          </Text>
          <Image source={{ uri: image }} style={styles.image} />
          <View style={styles.actionsContainer}>
            <Button
              onPress={() => setImage(null)}
              buttonColor={Colors.light.warning}
              style={styles.actionBtn}
              mode="contained"
            >
              No
            </Button>
            <Button
              style={styles.actionBtn}
              mode="contained"
              onPress={uploadImage}
            >
              Continuar
            </Button>
          </View>
        </View>
      )}
      {isPending && <ActivityIndicator size="large" />}
      {!did && (
        <View style={styles.container}>
          <Text variant="titleLarge" style={{ marginBottom: 20 }}>
            Primero debes crear tu DID
          </Text>
          <Link href="/" asChild>
            <Button style={styles.button} mode="contained">
              Ir a Identidad
            </Button>
          </Link>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    display: 'flex',
    justifyContent: 'center',
    width: 200,
    height: 50,
  },
  containerUpload: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
  },
  image: {
    width: 350,
    height: 250,
  },
  text: {
    textAlign: 'center',
    marginBottom: 10,
  },
  actionsContainer: {
    marginTop: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 5,
  },
  actionBtn: {
    flex: 1,
  },
});
