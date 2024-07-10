import React from 'react';
import { Portal, Dialog, Text, Button } from 'react-native-paper';
import { useModal } from '@/providers/ModalProvider';

const Modal = () => {
  const { modalVisible, modalMessage, hideModal, cancelModal } = useModal();

  return (
    <Portal>
      <Dialog visible={modalVisible} onDismiss={hideModal}>
        <Dialog.Title>Atención</Dialog.Title>
        <Dialog.Content>
          <Text>{modalMessage}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={hideModal} mode="contained-tonal">
            Si, quiero eliminar
          </Button>
          <Button onPress={cancelModal} mode="contained">
            Cancelar
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export { Modal };
