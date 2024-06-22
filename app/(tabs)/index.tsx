import React, { useState } from 'react';
import { StyleSheet, View, Platform, Text, TouchableOpacity, Dimensions } from 'react-native';
import { ActivityIndicator, Button, Menu, Divider, Provider } from 'react-native-paper';
import { useDidMutation } from '@/hooks/mutations/useDidMutation';
import * as SecureStore from 'expo-secure-store';
import { KEY_DID_SECURE_STORE } from '@/constants/secureStore';
import { List } from '@/components/List';

const storedDid =
  Platform.OS !== 'web' ? SecureStore.getItem(KEY_DID_SECURE_STORE) : '';

const { width } = Dimensions.get('window');

// Componente de acordeón para mostrar/ocultar detalles
const Accordion = ({ title, children }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleAccordion = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={[styles.accordionContainer, { backgroundColor: isExpanded ? '#e1e1e1' : '#f2f2f2' }]}>
      <TouchableOpacity onPress={toggleAccordion}>
        <Text style={styles.accordionTitle}>{title}</Text>
      </TouchableOpacity>
      {isExpanded && <View>{children}</View>}
    </View>
  );
};

export default function HomeScreen() {
  const { createDid, isPending } = useDidMutation();
  const [did, setDid] = useState<string | null>(storedDid);
  const [selectedDIDType, setSelectedDIDType] = useState('default'); // Default or whatever your initial DID type is

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
          <Accordion title="Identificador Descentralizado (DID)">
          <View style={styles.didContainer}>
              <Text style={styles.didText}>{did}</Text>
          </View>
          </Accordion>
        )}

        {!isPending && !did && (
          <>
            <Text style={styles.text}>
              Primero se debe generar un Identificador Descentralizado (DID) que te identificará
              al momento de recibir credenciales de los emisores confiables.
            </Text>
            <Button style={styles.button} mode="contained" onPress={handleCreateDid}>
              Crea tu DID
            </Button>
            <Accordion title="Seleccionar Tipo DID">
              <Menu>
                <Menu.Item onPress={() => setSelectedDIDType('default')} title="Default" />
                <Divider />
              </Menu>
            </Accordion>
          </>
        )}
        {isPending && <ActivityIndicator size="large" />}
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 50,
    marginBottom: 0,
  },
  scrollView: {
    marginTop: 10,
    marginBottom: 0,
  },
  button: {
    marginTop: 20,
    width: 200,
    height: 50,
    justifyContent: 'center',
    alignSelf: 'center',
    borderRadius: 25,
    fontSize: 16,
    fontFamily: 'Roboto', 
  },
  h1: {
    fontSize: 24, 
    fontWeight: 'bold',
    color: '#00d27d',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Roboto', 
  },
  text: {
    fontSize: 16, 
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 0,
    fontFamily: 'Roboto', 
    color: '#333',
  },
  accordionContainer: {
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
  accordionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 5,
  },
  didContainer: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 20,
    borderRadius: 0,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    width: width - 32, // Span the width of the device with some margin
    alignSelf: 'center',
  },
  didTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333333',
    paddingHorizontal:0,
  },
  didText: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'System',
    color: '#333333',
    textAlign: 'center',
  },
});
