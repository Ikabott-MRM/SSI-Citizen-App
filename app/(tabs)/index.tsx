import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Platform,
  Text,
  TouchableOpacity,
  Alert,
  TextStyle,
} from 'react-native';
import { ActivityIndicator, Button, useTheme } from 'react-native-paper';
import { useDidMutation } from '@/hooks/mutations/useDidMutation';
import { KEY_DID_SECURE_STORE } from '@/constants/secureStore';
import { CustomTheme } from '@/@types/theme';
import { deleteCredentials, deleteDatabase, initDatabase } from '@/database/db';
import { useModal } from '@/providers/ModalProvider';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-root-toast';
import { SecureMMKV } from '../../services/secure-store';
import { useSecureStore } from '@/providers/SecureStoreProvider';

type Styles = {
  accordionContainer: object;
  accordionTitle: TextStyle;
};

// Accordion component - show/hide DID - Open by default
const Accordion = ({
  styles,
  title,
  children,
  isOpen = false,
}: {
  styles: Styles;
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(isOpen);

  const toggleAccordion = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={[styles.accordionContainer, { backgroundColor: '#444' }]}>
      <TouchableOpacity onPress={toggleAccordion}>
        <Text style={styles.accordionTitle}>{title}</Text>
      </TouchableOpacity>
      {isExpanded && <View>{children}</View>}
    </View>
  );
};

export default function HomeScreen() {
  const { t } = useTranslation();
  const theme = useTheme<CustomTheme>();
  const secureStoreInstance = useSecureStore();
  const { showModal } = useModal({
    onClose: async () => {
      await deleteCredentials();
      await deleteDatabase();
      if (secureStoreInstance) {
        secureStoreInstance.deleteItem(KEY_DID_SECURE_STORE);
      }
      setDid(null);
    },
  });
  const { createDid, isPending } = useDidMutation();
  const [did, setDid] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchStoredDid = async () => {
      if (secureStoreInstance && Platform.OS !== 'web') {
        const storedDid =
          await secureStoreInstance.getItem(KEY_DID_SECURE_STORE);
        setDid(storedDid);
      }
    };

    fetchStoredDid();
  }, []);

  const handleCreateDid = async () => {
    await createDid(undefined, {
      onSuccess: async data => {
        if (secureStoreInstance) {
          await secureStoreInstance.setItem(KEY_DID_SECURE_STORE, data.uri);
        }

        setDid(data.uri);
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

  const handleDeleteDid = async () => {
    showModal(
      'Al borrar el DID se eliminarán todas las credenciales y solicitudes de la aplicación. ¿Está seguro de que desea eliminar todo y empezar de nuevo?',
    );
  };

  const copyToClipboard = async () => {
    if (!did) return;
    await Clipboard.setStringAsync(did);
    Alert.alert(t('Copied to clipboard'), did);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>{t('Welcome to IDA DEMO')}</Text>
      {did && (
        <Accordion
          title={t('Decentralized identifier (DID)')}
          styles={styles}
          isOpen={true}
        >
          <View style={styles.didContainer}>
            <Text style={styles.didTextInput}>{did}</Text>
            <TouchableOpacity
              onPress={copyToClipboard}
              style={styles.iconContainer}
            >
              <Ionicons name="copy-outline" size={20} color="#CCC" />
            </TouchableOpacity>
          </View>
        </Accordion>
      )}
      {!isPending && !did && (
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
        </>
      )}
      {!isPending && did && (
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
    buttonLabel: {
      fontSize: 18,
      color: '#444',
    },
    button: {
      marginTop: 20,
      width: 200,
      height: 50,
      justifyContent: 'center',
      alignSelf: 'center',
      borderRadius: 25,
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
