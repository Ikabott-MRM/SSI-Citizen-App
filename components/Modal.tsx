import React from 'react';
import { Portal, Dialog, Text, Button } from 'react-native-paper';
import { useModal } from '@/providers/ModalProvider';

const Modal = () => {
  const {
    modalVisible,
    modalMessage,
    modalTitle,
    confirmButtonText,
    cancelButtonText,
    hideModal,
    callbackRef,
    cancelCallbackRef,
  } = useModal();

  const confirmAction = () => {
    if (callbackRef.current) {
      callbackRef.current();
    }
  };

  const cancelAction = () => {
    if (cancelCallbackRef.current) {
      cancelCallbackRef.current();
    }
  };

  return (
    <Portal>
      <Dialog visible={modalVisible} onDismiss={hideModal}>
        <Dialog.Title
          style={{
            textAlign: 'center',
            fontWeight: 'bold',
          }}
        >
          {modalTitle}
        </Dialog.Title>
        <Dialog.Content>
          <Text
            style={{
              fontSize: 16,
              lineHeight: 24,
              textAlign: 'center',
              marginBottom: 20,
            }}
          >
            {modalMessage}
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button
            style={{
              margin: 10,
              paddingVertical: 5,
              paddingHorizontal: 10,
              justifyContent: 'center',
              alignSelf: 'center',
              borderRadius: 25,
              backgroundColor: '#CCC',
            }}
            onPress={confirmAction}
            mode="contained-tonal"
          >
            {confirmButtonText}
          </Button>
          <Button
            style={{
              margin: 10,
              paddingVertical: 5,
              paddingHorizontal: 10,
              justifyContent: 'center',
              alignSelf: 'center',
              borderRadius: 25,
              backgroundColor: '#00ff85',
            }}
            labelStyle={{ color: '#444' }}
            onPress={cancelAction}
            mode="contained"
          >
            {cancelButtonText}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export { Modal };
