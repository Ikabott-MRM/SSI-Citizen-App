import React, { useState } from 'react';
import {
  Portal,
  Dialog,
  Text,
  Button,
  TextInput,
  ActivityIndicator,
} from 'react-native-paper';
import { useModal } from '@/providers/ModalProvider';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

const FormModal = () => {
  const {
    formModalVisible,
    modalMessage,
    modalTitle,
    confirmButtonText,
    cancelButtonText,
    formCallbackRef,
    inputTitle1Text,
    inputTitle2Text,
    validateInput1,
    validateInput2,
    errorMsgInput1,
    errorMsgInput2,
    cancelCallbackRef,
    loading,
  } = useModal();

  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [error1, setError1] = useState('');
  const [error2, setError2] = useState('');

  const handleFormSubmit = () => {
    if (formCallbackRef.current) {
      formCallbackRef.current(input1, input2);
      setInput1('');
      setInput2('');
      setError1('');
      setError2('');
    }
  };

  const handleFormCancel = () => {
    if (cancelCallbackRef.current) {
      cancelCallbackRef.current();
      setInput1('');
      setInput2('');
      setError1('');
      setError2('');
    }
  };

  const handleInput1Change = (text: string) => {
    setInput1(text);

    if (validateInput1) {
      // If validation function is passed, use it
      if (!validateInput1(text)) {
        setError1(errorMsgInput1);
      } else {
        setError1('');
      }
    }
  };

  const handleInput2Change = (text: string) => {
    setInput2(text);
    if (validateInput2) {
      // If validation function is passed, use it
      if (!validateInput2(text)) {
        setError2(errorMsgInput2);
      } else {
        setError2('');
      }
    }
  };

  return (
    <Portal>
      <Dialog visible={formModalVisible} dismissable={false}>
        {loading ? (
          <ActivityIndicator size="large" style={{ marginBottom: 20 }} />
        ) : (
          <>
            <ScrollView>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
              >
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
                      <Text style={{ marginBottom: 10 }}>
                        {inputTitle1Text}
                      </Text>
                      <TextInput
                        mode="outlined"
                        value={input1}
                        onChangeText={handleInput1Change}
                        placeholder={inputTitle1Text}
                        style={{ marginBottom: 20, backgroundColor: 'white' }}
                      />
                      {error1 ? (
                        <Text style={{ color: 'red', marginBottom: 10 }}>
                          {error1}
                        </Text>
                      ) : null}
                    </>
                  )}

                  {inputTitle2Text && (
                    <>
                      <Text style={{ marginBottom: 10 }}>
                        {inputTitle2Text}
                      </Text>
                      <TextInput
                        mode="outlined"
                        value={input2}
                        onChangeText={handleInput2Change}
                        placeholder={inputTitle2Text}
                        secureTextEntry
                        style={{ marginBottom: 20, backgroundColor: 'white' }}
                      />
                      {error2 ? (
                        <Text style={{ color: 'red', marginBottom: 10 }}>
                          {error2}
                        </Text>
                      ) : null}
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
                    labelStyle={{ color: '#444' }}
                    onPress={handleFormCancel}
                    mode="contained"
                  >
                    {cancelButtonText}
                  </Button>
                  <Button
                    style={{
                      margin: 10,
                      paddingVertical: 5,
                      paddingHorizontal: 10,
                      justifyContent: 'center',
                      alignSelf: 'center',
                      borderRadius: 25,

                      backgroundColor:
                        error1 ||
                        error2 ||
                        (!input1 && inputTitle1Text) ||
                        (!input2 && inputTitle2Text)
                          ? '#e5ffeb'
                          : '#00ff85',
                    }}
                    labelStyle={{ color: '#444' }}
                    disabled={Boolean(
                      error1 ||
                        error2 ||
                        (!input1 && inputTitle1Text) ||
                        (!input2 && inputTitle2Text),
                    )}
                    onPress={handleFormSubmit}
                    mode="contained-tonal"
                  >
                    {confirmButtonText}
                  </Button>
                </Dialog.Actions>
              </KeyboardAvoidingView>
            </ScrollView>
          </>
        )}
      </Dialog>
    </Portal>
  );
};

export { FormModal };
