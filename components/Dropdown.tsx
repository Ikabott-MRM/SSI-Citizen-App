import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
    <View style={styles.container}>
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
    </View>
  );
};

const stylesFnc = (colors: { typography: { secondary: string } }) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      padding: 16,
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
      paddingRight: 30, // to ensure the text is never behind the icon
    },
    inputAndroid: {
      fontSize: 16,
      paddingHorizontal: 10,
      paddingVertical: 8,
      color: colors.typography.secondary,
      backgroundColor: colors.background.secondary,
      paddingRight: 30, // to ensure the text is never behind the icon
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
