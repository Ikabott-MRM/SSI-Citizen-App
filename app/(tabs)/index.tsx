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
import { encryptData } from '@/services/encryptionService';
import {
  generateRandomCode,
  validateEmail,
  validateFiveDigitCode,
} from '@/utils/helpers';

import { Accordion } from '@/components/Accordion';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const { t } = useTranslation();
  const theme = useTheme<CustomTheme>();
  const {
    didUri,
    setDidUri,
    setPortableDid,
    portableDid,
    isBackupDeclined,
    setIsBackupDeclined,
  } = useDid();
  const { showModal, showFormModal, hideModal } = useModal();
  const { createDid, isPending } = useDidMutation();
  const [verificationCode, setVerificationCode] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [vCodeAttempts, setVCodeAttempts] = useState(0);

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

  const setVerificationCodeAsync = async (code: string) => {
    try {
      await AsyncStorage.setItem('verificationCode', code);
    } catch (error) {
      console.error('Error saving verification code:', error);
      setSnackbarMessage('Error saving verification code');
      setSnackbarVisible(true);
    }
  };

  const getVerificationCodeAsync = async () => {
    try {
      const code = await AsyncStorage.getItem('verificationCode');
      return code || '';
    } catch (error) {
      console.error('Error retrieving verification code:', error);
      setSnackbarMessage('Error retrieving verification code');
      setSnackbarVisible(true);
      return '';
    }
  };

  const handleVerificationCodeUpdate = async (newVCode: string) => {
    setVerificationCode(newVCode);
    await setVerificationCodeAsync(newVCode);
  };

  const deleteDid = async () => {
    await deleteCredentials();
    await deleteDatabase();
    setDidUri('');
    setIsBackupDeclined(false);
    handleVerificationCodeUpdate('');
    hideModal();
  };

  const handleDeleteDid = async () => {
    showModal(
      'Al borrar el DID se eliminarán todas las credenciales y solicitudes de la aplicación. ¿Está seguro de que desea eliminar todo y empezar de nuevo?',
      undefined,
      undefined,
      undefined,
      deleteDid,
    );
  };

  const handleRetrieveDid = async () => {
    showModal('Recuperar DID', 'Recuperar DID', 'Ok', undefined, () => {
      console.log('Modal closed. Just for testing the retrieve modal button.');
    });
  };

  const handleCreateDid = async () => {
    await createDid(undefined, {
      onSuccess: async data => {
        setDidUri(data.uri);
        setPortableDid(JSON.stringify(data));
        await initDatabase();
      },
      onError: error => {
        if (typeof error === 'string') {
          Toast.show(error, {
            duration: Toast.durations.LONG,
            position: Toast.positions.BOTTOM,
          });
        }
      },
    });
  };

  const handleDidBackup = async (input1: string, input2?: string) => {
    console.log('Email:', input1);
    console.log('Password:', input2);

    const encryptedPortableDid = await encryptData(portableDid!, input2!, t);
    const verificationCode = generateRandomCode();
    //TODO aca se integraria con el endpoint del mail
    //a la vuelta del endpoint se setea el codgo para compararlo
    hideModal();
    console.log(verificationCode);
    handleVerificationCodeUpdate(verificationCode);
  };

  const showInvalidCodeAlert = () => {
    Alert.alert(
      'Invalid verification code',
      'You have reached the maximum attempts for entering an invalid code. Please restart the backup process if you want the backup. The email that has been sent to you on the first attempt of backup will no longer be valid.',
      [
        {
          text: 'Understood',
          onPress: () => {
            hideModal();
            setVCodeAttempts(0);
            handleVerificationCodeUpdate('');
          },
        },
      ],
      { cancelable: false },
    );
  };

  const verifyCode = async (input1: string) => {
    const validCode = input1 === verificationCode;
    if (validCode) {
      setSnackbarMessage('Your DID has been successfully backed up');
      setSnackbarVisible(true);
      hideModal();
    } else {
      setSnackbarMessage('Incorrect code, please try again');
      setSnackbarVisible(true);
      setVCodeAttempts(prevAttempts => prevAttempts + 1);
    }
  };

  const declineDidBackup = (): void => {
    Alert.alert(
      'Your DID won’t be backed up.',
      'By pressing `Understood` and leaving this step incomplete, you are choosing not to back up your DID. Your DID will remain unbacked up until you restart the backup process.',
      [
        {
          text: 'Understood',
          onPress: () => {
            setIsBackupDeclined(true);
            setVCodeAttempts(0);
            handleVerificationCodeUpdate('');
            hideModal();
          },
        },
      ],
      { cancelable: true },
    );
  };

  useEffect(() => {
    const fetchVerificationCode = async () => {
      const storedCode = await getVerificationCodeAsync();
      setVerificationCode(storedCode);
    };

    fetchVerificationCode();
  }, []);

  useEffect(() => {
    if (vCodeAttempts >= 3) {
      showInvalidCodeAlert();
    }
  }, [vCodeAttempts]);

  //TODO aca para que solo se muestre si no se ha hecho backup aun es que
  //tengo que usar ver si ademas hay una password seteada

  useEffect(() => {
    if (verificationCode) {
      showFormModal(
        t('Backup code'),
        'Enter the code you have just received by email.',
        t('Verify'),
        t('Cancel'),
        verifyCode,
        validateFiveDigitCode,
        () => true,
        declineDidBackup,
        'The code must be five digits.',
        undefined,
        'Code',
        '',
      );
    }
  }, [verificationCode]);

  useEffect(() => {
    if (portableDid && !verificationCode && !isBackupDeclined) {
      showModal(
        t('Do you want to backup your DID?'),
        t(''),
        t('Yes'),
        t('No'),
        () => {
          showFormModal(
            'DID Backup',
            `Please enter the email address where you'd like to get your backup, along with a password for encryption.`,
            'Backup',
            'Cancel',
            handleDidBackup,
            validateEmail,
            () => true,
            declineDidBackup,
            'Invalid email',
            undefined,
            'Email',
            'Password',
          );
        },
        declineDidBackup,
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
            onPress={handleRetrieveDid}
          >
            {t('Have a DID? Retrieve it.')}
          </Button>
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
            Borrar tu DID {'\n'}(Solo para Test)
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
      height: 'auto',
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
    text: {
      fontSize: 16,
      lineHeight: 24,
      textAlign: 'center',
      marginBottom: 20,
      color: css.text.color,
    },
    accordionContainer: {
      marginBottom: 20,
      backgroundColor: '#f9f9f9',
      borderRadius: 5,
      marginTop: 50,
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
