import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { CustomTheme } from '@/@types/theme';
import Dropdown from '@/components/Dropdown';
import { Language, StorageKey } from '@/@types/language';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Credentials() {
  const { i18n } = useTranslation();
  const theme = useTheme<CustomTheme>();
  const styles = stylesFnc(theme.customColors);

  const handleSelectLanguage = async (lng: Language) => {
    await i18n.changeLanguage(lng);
    await AsyncStorage.setItem(StorageKey.language, lng);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Dropdown
          value={i18n.language}
          onValueChange={handleSelectLanguage}
          items={[
            { label: 'English', value: 'en' },
            { label: 'Español', value: 'es' },
          ]}
        />
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
  });
