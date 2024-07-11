import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { FAB, useTheme, Portal, Modal, Text, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { CustomTheme } from '@/@types/theme';

const FabWithMenu = () => {
  const theme = useTheme<CustomTheme>();
  const router = useRouter();
  const [visible, setVisible] = React.useState(false);
  const toggleModal = () => {
    setVisible(!visible);
  };

  const handleNewCredential = () => {
    setVisible(false);
    router.push('/identitySubmission');
  };

  return (
    <View style={styles.container}>
      <FAB
        style={{
          ...styles.fab,
          backgroundColor: theme.colors.primary,
        }}
        color="#444"
        mode="flat"
        icon="plus"
        onPress={toggleModal}
      />
      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          contentContainerStyle={{
            backgroundColor: theme.customColors.background.color4,
            width: 350,
            alignSelf: 'center',
            paddingVertical: 20,
            borderRadius: 20,
          }}
        >
          <Text
            style={{
              color: theme.customColors.typography.primary,
              textAlign: 'center',
              fontSize: 24,
            }}
          >
            Solicitar Nueva Credencial
          </Text>
          <Button
            labelStyle={{
              fontSize: 18,
            }}
            style={styles.button}
            mode="contained"
            onPress={() => handleNewCredential()}
            textColor={theme.customColors.typography.color3}
          >
            Licencia de Conducir
          </Button>
          <Button
            labelStyle={{
              fontSize: 18,
            }}
            style={styles.buttonDisabled}
            mode="contained"
            textColor={theme.customColors.typography.color3}
            disabled={true}
          >
            Pasaporte
          </Button>
          <Button
            labelStyle={{
              fontSize: 18,
            }}
            style={styles.buttonDisabled}
            mode="contained"
            textColor={theme.customColors.typography.color3}
            disabled={true}
          >
            Documento de Identidad
          </Button>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'flex-end',
    marginBottom: 15,
  },
  fab: {
    borderRadius: 50,
  },
  menu: {
    backgroundColor: '#f2f2f2',
    position: 'absolute',
    top: -50,
    minWidth: 120,
    right: 0,
    color: '#333',
    fontWeight: 600,
    borderWidth: 1,
    borderColor: '#F9f9f9',
    zIndex: 999,
    fontSize: 16,
    lineHeight: 24,
    borderRadius: 5,
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'System',
  },
  option: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },
  button: {
    marginTop: 20,
    width: 300,
    height: 50,
    justifyContent: 'center',
    alignSelf: 'center',
    borderRadius: 25,
    fontFamily: 'Roboto',
  },
  buttonDisabled: {
    marginTop: 20,
    width: 300,
    height: 50,
    justifyContent: 'center',
    alignSelf: 'center',
    borderRadius: 25,
    fontFamily: 'Roboto',
    backgroundColor: '#464646',
  },
});

export default FabWithMenu;
