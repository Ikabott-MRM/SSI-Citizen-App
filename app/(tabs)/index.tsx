import 'react-native-get-random-values';
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Platform,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  ActivityIndicator,
  Button,
  Snackbar,
  useTheme,
} from 'react-native-paper';
import { useDidMutation } from '@/hooks/mutations/useDidMutation';
import { CustomTheme } from '@/@types/theme';
import { deleteCredentials, deleteDatabase, initDatabase } from '@/database/db';
import { useModal } from '@/providers/ModalProvider';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-root-toast';
import { useDid } from '@/providers/DidProvider';
import { decryptData } from '@/services/encryptionService';
import {
  isDecryptionSuccessful,
  validateFiveDigitCode,
  validatePwd,
} from '@/utils/helpers';
import { useLocalSearchParams } from 'expo-router';
import { getPublicEnv } from '@/utils/publicEnv';

import { Accordion } from '@/components/Accordion';
import { useMailMutation } from '@/hooks/mutations/useMailMutation';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import {
  promptDidBackup,
  useVCodeAttempts,
  useVerificationCode,
} from '@/utils/didBackupHelpers';

export default function HomeScreen() {
  const { t } = useTranslation();
  const {
    didUri,
    setDidUri,
    setPortableDid,
    portableDid,
    isBackupDeclined,
    setIsBackupDeclined,
    isBackupCompleted,
    setBackupCompleted,
    vCodeAttempts,
    incrementVCodeAttempts,
    resetVCodeAttempts,
    verificationCode,
    setVerificationCode,
  } = useDid();
  const theme = useTheme<CustomTheme>();
  const { startBackup } = useLocalSearchParams();

  const { showModal, showFormModal, hideModal, setLoading } = useModal();
  const { createDid, isPending } = useDidMutation();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const { sendMail } = useMailMutation();
  const [selectedDocument, setSelectedDocument] =
    useState<DocumentPicker.DocumentPickerAsset>();

  const pushDebugLog = (message: string) => {
    const line = `[${new Date().toISOString()}] ${message}`;
    // Also try to emit to logcat (ReactNativeJS) when available.
    // eslint-disable-next-line no-console
    console.log(line);
    setDebugLog(prev => [line, ...prev].slice(0, 30));
  };

  useVCodeAttempts(t, hideModal);
  useVerificationCode({
    validateFiveDigitCode,
    t,
    setSnackbarMessage,
    setSnackbarVisible,
  });
  const styles = stylesFnc({
    container: {
      backgroundColor: theme.customColors.background.primary,
    },
    text: {
      color: theme.customColors.typography.secondary,
    },
    accordionTitle: {
      color: theme.colors.primary,
    },
    didContainer: {
      backgroundColor: theme.customColors.background.color3,
    },
    didTextInput: {
      color: theme.customColors.typography.secondary,
    },
  });

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
      });
      if (!result.canceled) {
        const successResult =
          result as DocumentPicker.DocumentPickerSuccessResult;
        setSelectedDocument(successResult.assets[0]);
      } else {
        Toast.show(t('Document selection cancelled.'), {
          duration: Toast.durations.LONG,
          position: Toast.positions.BOTTOM,
        });
      }
    } catch (error) {
      Toast.show(t('Error picking document.'), {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
      });
      console.error('Error picking document:', error);
    }
  };

  const deleteDid = async () => {
    await deleteCredentials();
    await deleteDatabase();
    setDidUri('');
    setIsBackupDeclined(false);
    setPortableDid('');
    setVerificationCode('');
    setBackupCompleted('');
    hideModal();
  };

  const handleDeleteDid = async () => {
    showModal(t('Delete DID confirmation message'), undefined, undefined, undefined, deleteDid);
  };

  const handleRetrieveDid = async (_input1: string, input2?: string) => {
    try {
      setLoading(true);
      const fileAsString = await FileSystem.readAsStringAsync(
        selectedDocument?.uri!,
      );
      const fileAsJson = JSON.parse(fileAsString);
      const decryptedData = await decryptData(fileAsJson, input2!);
      if (!decryptedData) throw new Error('Error decrypting file.');
      const validDecryption = isDecryptionSuccessful(decryptedData);

      if (validDecryption) {
        setPortableDid(decryptedData!);
        const portableDidAsJson = JSON.parse(decryptedData);
        setDidUri(portableDidAsJson.uri);
        Toast.show(t('Your DID has been successfully retrieved.'), {
          duration: Toast.durations.LONG,
          position: Toast.positions.BOTTOM,
        });
        setBackupCompleted('completed');
        setLoading(false);
        hideModal();
      } else {
        Toast.show(t('Error decrypting document. Please try again'), {
          duration: Toast.durations.LONG,
          position: Toast.positions.BOTTOM,
        });
        setLoading(false);
      }
    } catch (error) {
      Toast.show(t('Error reading document.'), {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
      });
      console.error('Error reading document:', error);
      setLoading(false);
      hideModal();
    }
  };

  const handleCreateDid = async () => {
    try {
      pushDebugLog('Create DID button pressed');
      const resolvedBaseUrl =
        getPublicEnv('EXPO_PUBLIC_API_BASE_URL') ?? 'https://api.ssi-api.xyz';
      const resolvedHasApiKey = Boolean(getPublicEnv('EXPO_PUBLIC_API_KEY'));
      pushDebugLog(
        `EXPO_PUBLIC_API_BASE_URL=${resolvedBaseUrl} (env=${String(
          getPublicEnv('EXPO_PUBLIC_API_BASE_URL'),
        )})`,
      );
      pushDebugLog(
        `EXPO_PUBLIC_API_KEY set=${resolvedHasApiKey} (env=${String(
          Boolean(getPublicEnv('EXPO_PUBLIC_API_KEY')),
        )})`,
      );

      Toast.show(t('Creating DID…'), {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
      });

      await createDid(undefined, {
        onSuccess: async data => {
          pushDebugLog(`Create DID success. uri=${data?.uri ?? '(missing)'}`);
          setDidUri(data.uri);
          setPortableDid(JSON.stringify(data));
          await initDatabase();
        },
        onError: error => {
          // This callback runs, but we also catch below for additional details.
          const msg =
            typeof error === 'string'
              ? error
              : error && typeof error === 'object' && 'message' in error
                ? String((error as { message?: unknown }).message)
                : String(error);
          pushDebugLog(`Create DID onError: ${msg}`);
        },
      });
    } catch (error) {
      const msg =
        typeof error === 'string'
          ? error
          : error && typeof error === 'object' && 'message' in error
            ? String((error as { message?: unknown }).message)
            : String(error);

      pushDebugLog(`Create DID threw: ${msg}`);
      Toast.show(t('Create DID failed', { message: msg }), {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
      });
    }
  };

  const cancelRetrieval = (): void => {
    Alert.alert(
      t('Your DID won’t be retrieved.'),
      t(
        'By pressing `Understood` you are choosing to finish the DID retrieval process. You will remain without DID until you restart the process or create a new one.',
      ),
      [
        {
          text: t('Understood'),
          onPress: () => {
            setSelectedDocument(undefined);
            hideModal();
          },
        },
      ],
      { cancelable: true },
    );
  };

  useEffect(() => {
    if (startBackup) {
      promptDidBackup(
        t,
        sendMail,
        setVerificationCode,
        resetVCodeAttempts,
        hideModal,
        setIsBackupDeclined,
        setLoading,
        portableDid!,
        showModal,
        showFormModal,
      );
    }
  }, [startBackup]);

  useEffect(() => {
    if (selectedDocument) {
      showFormModal(
        t('Password for decryption'),
        t(
          'Please enter the password you used when you choose to backu up your DID.',
        ),
        t('Confirm'),
        t('Cancel'),
        handleRetrieveDid,
        () => true,
        validatePwd,
        cancelRetrieval,
        undefined,
        t(
          'Invalid password.\nPassword must be 8 alphanumeric characters and contain at least one number.',
        ),
        undefined,
        t('Password'),
      );
    }
  }, [selectedDocument]);

  useEffect(() => {
    if (
      portableDid &&
      !verificationCode &&
      !isBackupDeclined &&
      !isBackupCompleted
    ) {
      promptDidBackup(
        t,
        sendMail,
        setVerificationCode,
        resetVCodeAttempts,
        hideModal,
        setIsBackupDeclined,
        setLoading,
        portableDid!,
        showModal,
        showFormModal,
      );
    }
  }, [portableDid]);

  const copyToClipboard = async () => {
    if (!didUri) return;
    await Clipboard.setStringAsync(didUri);
    Alert.alert(t('Copied to clipboard'), didUri);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>{t('Welcome to IDA DEMO')}</Text>
      {didUri && (
        <>
          <Accordion
            title={t('Decentralized identifier (DID)')}
            styles={styles}
            isOpen={true}
          >
            <View style={styles.didContainer}>
              <Text style={styles.didTextInput}>{didUri}</Text>
              <TouchableOpacity
                onPress={copyToClipboard}
                style={styles.iconContainer}
              >
                <Ionicons name="copy-outline" size={20} color="#CCC" />
              </TouchableOpacity>
            </View>
          </Accordion>
          {isBackupCompleted ? (
            <Text style={styles.info}>{t('DID has been backed up')}</Text>
          ) : (
            <TouchableOpacity
              onPress={() =>
                promptDidBackup(
                  t,
                  sendMail,
                  setVerificationCode,
                  resetVCodeAttempts,
                  hideModal,
                  setIsBackupDeclined,
                  setLoading,
                  portableDid!,
                  showModal,
                  showFormModal,
                )
              }
            >
              <Text style={styles.info}>
                {t('The DID has not been backed up.')}
              </Text>
              <Text style={styles.infoPressable}>
                {t('Click here to back it up now.')}
              </Text>
            </TouchableOpacity>
          )}
        </>
      )}
      {!isPending && !didUri && (
        <>
          <Text style={styles.text}>{t('Welcome description')}</Text>
          <Button
            labelStyle={styles.buttonLabel}
            style={styles.button}
            mode="contained"
            onPress={handleCreateDid}
          >
            {t('Create DID')}
          </Button>
          <Button
            labelStyle={styles.buttonLabel}
            style={styles.button}
            mode="contained"
            onPress={pickDocument}
          >
            {t('Have a DID? Retrieve it.')}
          </Button>
          {!!debugLog.length && (
            <View style={{ marginTop: 16, paddingHorizontal: 6 }}>
              <Text
                style={{
                  color: theme.customColors.typography.secondary,
                  fontSize: 12,
                  marginBottom: 6,
                }}
              >
                {t('Debug log (latest first)')}
              </Text>
              {debugLog.slice(0, 6).map(line => (
                <Text
                  key={line}
                  style={{
                    color: theme.customColors.typography.secondary,
                    fontSize: 10,
                    marginBottom: 2,
                  }}
                >
                  {line}
                </Text>
              ))}
            </View>
          )}
        </>
      )}
      {!isPending && didUri && (
        <>
          <Button
            labelStyle={styles.buttonLabel}
            style={styles.buttonDelete}
            mode="contained"
            onPress={handleDeleteDid}
          >
            {t('Delete DID test button')}
          </Button>
        </>
      )}
      {isPending && <ActivityIndicator size="large" />}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={Snackbar.DURATION_SHORT}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

const stylesFnc = (css: {
  container: { backgroundColor: string };
  text: { color: string };
  accordionTitle: { color: string };
  didContainer: { backgroundColor: string };
  didTextInput: { color: string };
}) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: css.container.backgroundColor,
      paddingHorizontal: 20,
      paddingTop: 50,
      marginBottom: 0,
    },
    button: {
      paddingHorizontal: 10,
      width: 'auto',
      alignSelf: 'center',
      marginTop: 20,
      height: 50,
      justifyContent: 'center',
      borderRadius: 25,
      color: '#444',
    },
    buttonLabel: {
      textAlign: 'center',
      fontSize: 18,
      color: '#444',
    },
    buttonDelete: {
      marginTop: 20,
      width: 200,
      height: 50,
      justifyContent: 'center',
      alignSelf: 'center',
      borderRadius: 25,
      color: '#444',
      backgroundColor: '#888',
    },
    h1: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#00ff85',
      textAlign: 'center',
      marginBottom: 20,
    },
    info: {
      fontSize: 16,
      fontWeight: 'light',
      color: css.didTextInput.color,
      textAlign: 'center',
      marginBottom: 7,
    },
    infoPressable: {
      fontSize: 16,
      fontWeight: 'light',
      textDecorationLine: 'underline',
      color: css.didTextInput.color,
      textAlign: 'center',
      marginBottom: 20,
    },
    text: {
      fontSize: 16,
      lineHeight: 24,
      textAlign: 'center',
      marginBottom: 20,
      color: css.text.color,
    },
    accordionContainer: {
      marginBottom: 10,
      backgroundColor: '#f9f9f9',
      borderRadius: 5,
      marginTop: 30,
    },
    accordionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: css.accordionTitle.color,
      paddingVertical: 10,
      paddingHorizontal: 15,
      marginBottom: 5,
      textAlign: 'center',
    },
    didContainer: {
      backgroundColor: css.didContainer.backgroundColor,
      paddingVertical: 10,
      borderRadius: 5,
      margin: 10,
    },
    iconContainer: {
      position: 'absolute',
      right: 5,
      bottom: 5,
      cursor: 'pointer',
    },
    didTextInput: {
      fontSize: 16,
      lineHeight: 24,
      fontFamily: Platform.OS === 'android' ? 'Roboto' : 'System',
      color: css.didTextInput.color,
      textAlign: 'center',
      paddingHorizontal: 10,
    },
    textSmall: {
      fontSize: 12,
      textAlign: 'center',
    },
  });
