import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Platform,
  Text,
  TouchableOpacity,
  Dimensions,
  TextInput,
} from 'react-native';
import { ActivityIndicator, Button, useTheme } from 'react-native-paper';
import { useDidMutation } from '@/hooks/mutations/useDidMutation';
import * as SecureStore from 'expo-secure-store';
import { KEY_DID_SECURE_STORE } from '@/constants/secureStore';

const storedDid =
  Platform.OS !== 'web' ? SecureStore.getItem(KEY_DID_SECURE_STORE) : '';

// Accordion component - show/hide DID - Open by default
const Accordion = ({ styles, title, children, isOpen = false }) => {
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
  const theme = useTheme();
  const { createDid, isPending } = useDidMutation();
  const [did, setDid] = useState<string | null>(storedDid);
  const styles = stylesFnc({
    container: {
      backgroundColor: theme.colors.background.primary,
    },
    text: {
      color: theme.colors.typography.secondary,
    },
    accordionTitle: {
      color: theme.colors.primary,
    },
    didContainer: {
      backgroundColor: theme.colors.background.color3,
    },
    didTextInput: {
      color: theme.colors.typography.secondary,
    },
  });

  const handleCreateDid = async () => {
    await createDid(undefined, {
      onSuccess: data => {
        SecureStore.setItem(KEY_DID_SECURE_STORE, data.uri);
        setDid(data.uri);
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Bienvenidos a IDA DEMO</Text>
      {did && (
        <Accordion
          title="Identificador Descentralizado (DID)"
          styles={styles}
          isOpen={true}
        >
          <View style={styles.didContainer}>
            <TextInput
              style={styles.didTextInput}
              value={did}
              editable={true}
              selectTextOnFocus={true}
              multiline={true}
            />
          </View>
        </Accordion>
      )}
      {!isPending && !did && (
        <>
          <Text style={styles.text}>
            Primero se debe generar un Identificador Descentralizado (DID) que
            te identificará al momento de recibir credenciales de los emisores
            confiables.
          </Text>
          <Button
            labelStyle={styles.buttonLabel}
            style={styles.button}
            mode="contained"
            onPress={handleCreateDid}
          >
            Crea tu DID
          </Button>
        </>
      )}
      {isPending && <ActivityIndicator size="large" />}
    </View>
  );
}

const stylesFnc = (css?: any) =>
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
    didTextInput: {
      fontSize: 16,
      lineHeight: 24,
      fontFamily: Platform.OS === 'android' ? 'Roboto' : 'System',
      color: css.didTextInput.color,
      textAlign: 'center',
      paddingHorizontal: 10,
    },
  });
