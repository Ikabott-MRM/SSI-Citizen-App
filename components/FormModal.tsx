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
    cancelModal,
    formCallbackRef,
    inputTitle1Text,
    inputTitle2Text,
    validateInput1, // validation function prop
    errorMsgInput1
  } = useModal();

  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [error, setError] = useState('');

  const handleFormSubmit = () => {
    if (formCallbackRef.current) {
      formCallbackRef.current(input1, input2);
      setInput1('');
      setInput2('');
    }
  };
  
  const handleInputChange = (text: string) => {
    setInput1(text);

    if (validateInput1) {
      // If validation function is passed, use it
      if (!validateInput1(text)) {
        setError(errorMsgInput1);
      } else {
        setError(''); // Clear error if valid
      }
    }
  };

  return (
    <Portal>
      <Dialog visible={formModalVisible} onDismiss={cancelModal}>
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

          {/* Input 1 - Visible if input1Title is provided */}
          {inputTitle1Text && (
            <>
              <Text style={{ marginBottom: 10 }}>{inputTitle1Text}</Text>
              <TextInput
                mode="outlined"
                value={input1}
                onChangeText={handleInputChange}
                placeholder={inputTitle1Text}
                style={{ marginBottom: 20 }}
              />
            {error ? (
                <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text>
              ) : null}
            </>
       
          )}

          {/* Input 2 - Visible if input2Title is provided */}
          {inputTitle2Text && (
            <>
              <Text style={{ marginBottom: 10 }}>{inputTitle2Text}</Text>
              <TextInput
                mode="outlined"
                value={input2}
                onChangeText={setInput2}
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
            onPress={cancelModal}
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
