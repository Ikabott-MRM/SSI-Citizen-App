import { Platform, StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { Link } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { KEY_DID_SECURE_STORE } from '@/constants/secureStore';

const did =
  Platform.OS !== 'web' ? SecureStore.getItem(KEY_DID_SECURE_STORE) : '';

const NoDID = () => {
  const theme = useTheme();
  const styles = styleFnc({
    container: {
      backgroundColor: theme.colors.background.primary,
    },
    title: {
      color: theme.colors.typography.secondary,
    },
  });

  return (
    !did && (
      <View style={styles.container}>
        <Text variant="titleLarge" style={styles.title}>
          Para solicitar una nueva credencial, primero necesitas crear un
          Identificador Digital Descentralizado (DID) en la sección 'Identidad'.
        </Text>
        <Link href="/" asChild>
          <Button
            labelStyle={styles.buttonLabel}
            style={styles.button}
            mode="contained"
          >
            Ir a Identidad
          </Button>
        </Link>
      </View>
    )
  );
};

export { NoDID };

const styleFnc = css =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: css.container.backgroundColor,
    },
    button: {
      width: 200,
      height: 50,
      justifyContent: 'center',
      alignSelf: 'center',
      borderRadius: 25,
    },
    buttonLabel: {
      fontSize: 18,
      color: '#444',
    },
    title: {
      marginBottom: 20,
      color: css.title.color,
      textAlign: 'center',
      fontSize: 16,
      lineHeight: 24,
    },
  });
