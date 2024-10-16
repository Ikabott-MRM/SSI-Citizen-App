import React, { useState } from 'react';
import { Portal, Dialog, Text, Button, TextInput } from 'react-native-paper';
import { useModal } from '@/providers/ModalProvider';

const FormModal = () => {
  const {
    formModalVisible,
    modalMessage,
    modalTitle,
    confirmButtonText,
    cancelButtonText,
    hideModal,
    formCallbackRef,
    inputTitle1Text,
    inputTitle2Text,
    validateInput1,
    validateInput2,
    errorMsgInput1,
    cancelCallbackRef,
  } = useModal();

  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [error, setError] = useState('');

  const handleFormSubmit = () => {
    if (formCallbackRef.current) {
      formCallbackRef.current(input1, input2);
      setInput1('');
      setInput2('');
      setError('');
    }
  };

  const handleFormCancel = () => {
    if (cancelCallbackRef.current) {
      cancelCallbackRef.current();
      setInput1('');
      setInput2('');
      setError('');
    }
  };

  const handleInput1Change = (text: string) => {
    setInput1(text);

    if (validateInput1) {
      // If validation function is passed, use it
      if (!validateInput1(text)) {
        setError(errorMsgInput1);
      } else {
        setError('');
      }
    }
  };

  const handleInput2Change = (text: string) => {
    setInput2(text);
    if (validateInput2) {
      // If validation function is passed, use it
      if (!validateInput2(text)) {
        setError(errorMsgInput1);
      } else {
        setError('');
      }
    }
  };

  return (
    <Portal>
      <Dialog visible={formModalVisible} onDismiss={hideModal}>
        <Dialog.Title>{modalTitle}</Dialog.Title>
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

          {inputTitle1Text && (
            <>
              <Text style={{ marginBottom: 10 }}>{inputTitle1Text}</Text>
              <TextInput
                mode="outlined"
                value={input1}
                onChangeText={handleInput1Change}
                placeholder={inputTitle1Text}
                style={{ marginBottom: 20 }}
              />
              {error ? (
                <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text>
              ) : null}
            </>
          )}

          {inputTitle2Text && (
            <>
              <Text style={{ marginBottom: 10 }}>{inputTitle2Text}</Text>
              <TextInput
                mode="outlined"
                value={input2}
                onChangeText={handleInput2Change}
                placeholder={inputTitle2Text}
                secureTextEntry
                style={{ marginBottom: 20 }}
              />
            </>
          )}
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
            disabled={error ? true : false}
            onPress={handleFormSubmit}
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
            onPress={handleFormCancel}
            mode="contained"
          >
            {cancelButtonText}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export { FormModal };
