import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Platform,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Button, Text, useTheme } from 'react-native-paper';
import { Stack } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '@/constants/Colors';
import { useIdentityMutation } from '@/hooks/mutations/useIdentityMutation';
import { KEY_DID_SECURE_STORE } from '@/constants/secureStore';
import Toast from 'react-native-root-toast';
import { useQueryClient } from '@tanstack/react-query';
import { REQUESTS_QUERY_KEYS } from '@/constants/queryKeys/requests';
import { CustomTheme } from '@/@types/theme';
import { useTranslation } from 'react-i18next';
import { useSecureStore } from '@/providers/SecureStoreProvider';

const dimensions = Dimensions.get('window');
const imageHeight = Math.round((dimensions.width * 9) / 16);
const imageWidth = dimensions.width - 30;

const THREE_MB: number = 3145728; // 3MB in bytes

const validateImageSize = (fileSize: number) => {
  return fileSize <= THREE_MB;
};

export default function Identity() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const router = useRouter();
  const theme = useTheme<CustomTheme>();
  const [image, setImage] = useState<string | null>(null);
  const {secureStoreInstance, did, setDid} = useSecureStore();
  const { uploadDocumentFile, isPending } = useIdentityMutation();
  const styles = styleFnc({
    container: {
      backgroundColor: theme.customColors.background.primary,
    },
  });

useEffect(() => {
  const fetchStoredDid = async () => {
    if (secureStoreInstance && Platform.OS !== 'web') {
      const storedDid = secureStoreInstance.getItem(KEY_DID_SECURE_STORE);
      setDid(storedDid);
    }
  };

  fetchStoredDid();
}, []);

  const pickImage = async () => {
    let isValidSize = false;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.2,
    });

    if (result.assets && result.assets[0]?.fileSize) {
      isValidSize = validateImageSize(result.assets[0].fileSize);
    }

    if (!result.canceled && !isValidSize) {
      Toast.show(t('Image size limit'), {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
      });
    }

    if (!result.canceled && isValidSize) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = () => {
    if (!image || !did) {
      return;
    }

    const formData = new FormData();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    formData.append('file', {
      uri: image,
      type: 'image/jpeg',
      name: 'document-image',
    });

    uploadDocumentFile(
      {
        did,
        formData,
      },
      {
        onSuccess: () => {
          Toast.show(t('Credential requested successfully'), {
            duration: Toast.durations.LONG,
            position: Toast.positions.BOTTOM,
          });
          queryClient
            .invalidateQueries({
              queryKey: [REQUESTS_QUERY_KEYS.GET_REQUESTS],
              refetchType: 'all',
            })
            .then(() => {
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
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: t('Upload identity proof'),
          headerBackTitle: '',
          headerTitleStyle: {
            color: theme.customColors.typography.secondary,
          },
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
            <Button style={styles.button} mode="contained" textColor="#444">
              {t('Upload image')}
            </Button>
          </View>
        </TouchableOpacity>
      )}
      {image && !isPending && did && (
        <View style={styles.imageContainer}>
          <Text style={styles.text} variant="titleLarge">
            {t('Do you want to confirm the selected image?')}
          </Text>
          <Image
            source={{ uri: image }}
            style={styles.image}
            height={imageHeight}
            width={imageWidth}
          />
          <View style={styles.actionsContainer}>
            <Button
              onPress={() => setImage(null)}
              buttonColor={Colors.light.warning}
              style={styles.actionBtn}
              mode="contained"
            >
              {t('No')}
            </Button>
            <Button
              style={styles.actionBtn}
              mode="contained"
              onPress={uploadImage}
              disabled={!image}
              textColor="#444"
            >
              {t('Confirm')}
            </Button>
          </View>
        </View>
      )}
      {isPending && <ActivityIndicator size="large" />}
    </View>
  );
}

const styleFnc = (css: { container: { backgroundColor: string } }) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      paddingTop: 150,
      backgroundColor: css.container.backgroundColor,
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
    imageContainer: {
      marginHorizontal: 15,
      flex: 1,
      paddingTop: 0,
      alignItems: 'center',
    },
    image: {
      width: '100%',
      aspectRatio: 4 / 3,
      resizeMode: 'contain',
    },
    text: {
      textAlign: 'center',
      marginBottom: 10,
      color: '#CCC',
    },
    actionsContainer: {
      marginTop: 10,
      marginHorizontal: 15,
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 5,
    },
    actionBtn: {
      flex: 1,
    },
  });
