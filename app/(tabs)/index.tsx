import 'react-native-get-random-values';
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
import { CustomTheme } from '@/@types/theme';
import { deleteCredentials, deleteDatabase, initDatabase } from '@/database/db';
import { useModal } from '@/providers/ModalProvider';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-root-toast';
import { useDid } from '@/providers/DidProvider';
import { encryptData } from '@/services/encryptionService';

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
  const { didUri, setDidUri, setPortableDid, portableDid } = useDid();
  const { showModal, showFormModal, hideModal } = useModal();
  const { createDid, isPending } = useDidMutation();
  const [backupCode, setBackupCode] = useState('');

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

  const deleteDid = async()=>{
    await deleteCredentials();
    await deleteDatabase();
    setDidUri('');
    hideModal();
  }

  const handleDidBackup = async(input1: string, input2?: string)=>{
      console.log('Email:', input1);
      console.log('Password:', input2);

      const encryptedPortableDid = await encryptData(portableDid!, input2!,t);
      //TODO aca se integraria con el endpoint del mail
      //a la vuelta del endpoint se setea el codgo para compararlo
      //cuando se setea ahi muestro otro modal con un input para comparar 
      hideModal();

      //TODO metodo para generar random five digit code 

      //creo que es mejor guardarlo en async storage y comparar de ahi, sino cada vez que abro se va a mostrar el modal. ver como chequeo eso
      setBackupCode('1234');

  }

  //TODO revisar si en todos mis onClose/onConfirm uso hideModal deberia de cambiar y me

  const verifyCode = async (input1:string)=>{
    console.log(`Mockeo verify code`, input1)

    
    hideModal();
  }


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

  //TODO mover estos metodos para un utils/helpers
  const validateEmail = (input: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(input);
  };

  const validateFiveDigitCode = (input: string): boolean => {
    const fiveDigitCodeRegex = /^\d{5}$/; 
    return fiveDigitCodeRegex.test(input);
  };

  useEffect(() => {
    if (backupCode) {
      console.log('abre modal')
      showFormModal(t('Backup code'), t('Verify'), t('Cancel'), verifyCode,validateFiveDigitCode,()=>true,undefined,undefined,"Code",'')}
  }, [backupCode]);

  useEffect(() => {
    //TODO agrego ese chequeo apra que no se abra el modal cada vez que vea que portableDid no esta en false 
    // si el codigo esta seteado es porque ya hizo backup 
    //pero si no se setea codigo porque capaz al primera vez marca que no, no tiene que abrirse el mdoal cada vez que abra la app
    //con que podria manejarse eso?
    // capaz si responde que no se tendria que marcar algo que deje guardado que eligio no hacerlo y usar eso para mostrar el boton de hacer backup en inicio
    if (portableDid && !backupCode) {
      showModal(t('Do you want to backup your DID?'), t(''), t('Yes'), t('No'), () => {
        showFormModal('DID Backup','Backup','Cancel',handleDidBackup,validateEmail,()=>true,"Invalid email",undefined,"Email","Password");
    })}
  }, [portableDid]);

  const handleDeleteDid = async () => {
    showModal(
      'Al borrar el DID se eliminarán todas las credenciales y solicitudes de la aplicación. ¿Está seguro de que desea eliminar todo y empezar de nuevo?',undefined,undefined,undefined,deleteDid
    );
  };

  const handleRetrieveDid = async () => {
    showModal('Recuperar DID', 'Recuperar DID', 'Ok',undefined, () => {
      console.log('Modal closed. Just for testing the retrieve modal button.');
    });
  };

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
