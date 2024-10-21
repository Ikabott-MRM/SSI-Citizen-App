import React from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { CustomTheme } from '@/@types/theme';
import Dropdown from '@/components/Dropdown';
import { Language, StorageKey } from '@/@types/language';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDid } from '@/providers/DidProvider';
import { useRouter } from 'expo-router';
import { version } from '../../package.json';

export default function Settings() {
  const { i18n, t } = useTranslation();
  const theme = useTheme<CustomTheme>();
  const styles = stylesFnc(theme.customColors);
  const { isBackupDeclined, didUri } = useDid();
  const router = useRouter();

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
        {didUri && isBackupDeclined && (
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
              onPress={goToBackup}
            >
              {t('Backup your DID.')}
            </Button>
          </View>
        )}
      </ScrollView>
      <View style={styles.aboutContainer}>
        <Text style={styles.aboutText}>
          {t('App Version')}: {version}
        </Text>
      </View>
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
