import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import { Button, Snackbar, useTheme } from 'react-native-paper';
import { CustomTheme } from '@/@types/theme';
import Dropdown from '@/components/Dropdown';
import { Language, StorageKey } from '@/@types/language';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDid } from '@/providers/DidProvider';
import { useRouter } from 'expo-router';
import { version } from '../../package.json';
import { promptDidBackup, useVCodeAttempts, useVerificationCode } from '@/utils/didBackupHelpers';
import { useModal } from '@/providers/ModalProvider';
import { validateFiveDigitCode } from '@/utils/helpers';
import { useMailMutation } from '@/hooks/mutations/useMailMutation';

export default function Settings() {
  const { i18n, t } = useTranslation();
  const { sendMail } = useMailMutation();

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const { isBackupDeclined, didUri, isBackupCompleted,setVerificationCode,resetVCodeAttempts,portableDid,setIsBackupDeclined,verificationCode,setBackupCompleted,incrementVCodeAttempts } = useDid();
  const {hideModal,setLoading,showFormModal,showModal} = useModal();
  const theme = useTheme<CustomTheme>();
  const styles = stylesFnc(theme.customColors);
  const router = useRouter();

  //TODO esto es lo que repite codigo nomas
  //TODO probar todo el flujo desde ambas pantallas para confirmar que quedo ok
  const verifyCode = async (input1: string) => {
    const validCode = input1 === verificationCode;
    if (validCode) {
      setSnackbarMessage(t('Your DID has been successfully backed up'));
      setSnackbarVisible(true);
      setBackupCompleted('completed');
      hideModal();
    } else {
      setSnackbarMessage(t('Incorrect code, please try again'));
      setSnackbarVisible(true);
      incrementVCodeAttempts();
      // setVCodeAttempts(prevAttempts => prevAttempts + 1);
    }
  };


  useVCodeAttempts(t, hideModal);
  useVerificationCode({ verifyCode, validateFiveDigitCode, t });
  
  const handleSelectLanguage = async (lng: Language) => {
    await i18n.changeLanguage(lng);
    await AsyncStorage.setItem(StorageKey.language, lng);
  };

  const goToBackup = () => {
    router.push({
      pathname: '/',
      params: { startBackup: 1 },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Dropdown
          value={i18n.language}
          onValueChange={handleSelectLanguage}
          items={[
            { label: 'English', value: 'en' },
            { label: 'Español', value: 'es' },
          ]}
        />
        {didUri && isBackupDeclined && !isBackupCompleted && (
          <View style={styles.backupContainer}>
            <Text style={styles.label}>
              {t(
                'Your DID is not backed up. Ensure its security by creating a backup now.',
              )}
            </Text>
            <Button
              labelStyle={styles.buttonLabel}
              style={styles.buttonDelete}
              mode="contained"
              // onPress={goToBackup}
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
              {t('Backup your DID')}
            </Button>
          </View>
        )}
      </ScrollView>
      <View style={styles.aboutContainer}>
        <Text style={styles.aboutText}>
          {t('App Version')}: {version}
        </Text>
      </View>
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

const stylesFnc = (colors: {
  background: { primary: string; secondary: string };
  typography: { secondary: string };
}) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      flex: 1,
      backgroundColor: colors.background.primary,
      paddingHorizontal: 20,
      paddingTop: 25,
    },
    content: {
      padding: 16,
      marginTop: 10,
    },
    backupContainer: {
      marginTop: 40,
    },
    label: {
      color: colors.typography.secondary,
      fontSize: 18,
      marginBottom: 8,
    },
    buttonLabel: {
      fontSize: 16,
      color: colors.typography.secondary,
    },
    buttonDelete: {
      height: 40,
      borderRadius: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background.secondary,
    },
    aboutContainer: {
      justifyContent: 'flex-end',
      alignItems: 'center',
      backgroundColor: colors.background.secondary,
      padding: 10,
      marginBottom: 20,
    },
    aboutText: {
      fontSize: 14,
      color: colors.typography.secondary,
    },
  });
