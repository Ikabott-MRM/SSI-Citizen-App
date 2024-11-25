import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { useTheme } from 'react-native-paper';
import { CustomTheme } from '@/@types/theme';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Language } from '@/@types/language';

type Option = {
  label: string;
  value: string;
};

type DropdownProps = {
  items: Array<Option>;
  onValueChange: (arg: Language) => void;
  value: string;
};

const Dropdown = ({ items, onValueChange, value }: DropdownProps) => {
  const { t } = useTranslation();
  const theme = useTheme<CustomTheme>();
  const dropStyles = dropdownStylesFnc(theme.customColors);
  const styles = stylesFnc(theme.customColors);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.label}>{t('Select a language')}:</Text>
        <RNPickerSelect
          value={value}
          placeholder={{}} // Keep it here as an empty {} to remove the placeholder
          onValueChange={onValueChange}
          items={items}
          useNativeAndroidPickerStyle={false}
          Icon={() => {
            return <Ionicons name="caret-down" size={16} color="#CCC" />;
          }}
          style={dropStyles}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const stylesFnc = (colors: {
  typography: { secondary: string };
  background: { secondary: string };
}) => {
  return StyleSheet.create({
    container: {
      alignContent: 'center',
      justifyContent: 'center',
      flex: 1,
    },
    content: {
      marginBottom: 40,
    },
    label: {
      color: colors.typography.secondary,
      fontSize: 18,
      marginBottom: 8,
    },
    selectedValue: {
      marginTop: 16,
      fontSize: 18,
    },
    aboutContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background.secondary,
      padding: 10,
      marginTop: 50,
    },
    aboutText: {
      fontSize: 14,
      color: colors.typography.secondary,
    },
  });
};

const dropdownStylesFnc = (colors: {
  background: { secondary: string };
  typography: { secondary: string };
}) => {
  return StyleSheet.create({
    inputIOS: {
      fontSize: 16,
      paddingVertical: 12,
      paddingHorizontal: 10,
      color: colors.typography.secondary,
      backgroundColor: colors.background.secondary,
      paddingRight: 30,
    },
    inputAndroid: {
      fontSize: 16,
      paddingHorizontal: 10,
      paddingVertical: 8,
      color: colors.typography.secondary,
      backgroundColor: colors.background.secondary,
      paddingRight: 30,
    },
    iconContainer: {
      top: 15,
      right: 17,
    },
    chevron: {
      display: 'none',
    },
  });
};

export default Dropdown;
