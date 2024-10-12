import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useRef,
  MutableRefObject,
} from 'react';

interface ModalState {
  modalVisible: boolean;
  modalMessage:string;
  formModalVisible: boolean;
  modalTitle: string;
  confirmButtonText: string;
  cancelButtonText: string;
  inputTitle1Text: string;
  inputTitle2Text: string;
  errorMsgInput1: string;
  errorMsgInput2: string;
  validateInput1: (input: string) => boolean; 
  validateInput2: (input: string) => boolean;
}

interface ModalContextType extends ModalState {
  showModal: (
    message: string,
    title?: string,
    confirmButtonText?: string,
    cancelButtonText?: string,
    onClose?: () => void | Promise<void>
  ) => void;
  showFormModal: (
    title: string,
    confirmButton: string,
    cancelButton: string,
    onConfirm: (input1: string, input2?: string) => Promise<void>,
    validation1: (input: string) => boolean,
    validation2: (input: string) => boolean,
    errorMsgInput1?: string,
    errorMsgInput2?: string,
    inputTitle1Text?: string,
    inputTitle2Text?: string,
  ) => void;
  hideModal: () => void;
  cancelModal: () => void;
  setCallback: (callback: () => void) => void;
  callbackRef: MutableRefObject<(() => void | Promise<void>) | null>;
  formCallbackRef: MutableRefObject<((input1: string, input2?: string) => Promise<void>) | null>;
}

const ModalContext = createContext<ModalContextType>({
  modalVisible: false,
  modalMessage:'',
  formModalVisible: false,
  modalTitle: '',
  confirmButtonText: '',
  cancelButtonText: '',
  inputTitle1Text: '',
  inputTitle2Text: '',
  errorMsgInput1: '',
  errorMsgInput2: '',
  validateInput1: () => true,
  validateInput2: () => true,
  showModal: () => {},
  showFormModal: () => {},
  hideModal: () => {},
  cancelModal: () => {},
  setCallback: () => {},
  callbackRef: useRef(null),
  formCallbackRef: useRef(null),
});

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider = ({ children }: ModalProviderProps) => {

  const initialState: ModalState = {
    modalVisible: false,
    modalMessage:'',
    formModalVisible: false,
    modalTitle: '',
    confirmButtonText: '',
    cancelButtonText: '',
    inputTitle1Text: '',
    inputTitle2Text: '',
    errorMsgInput1: '',
    errorMsgInput2: '',
    validateInput1: () => true,
    validateInput2: () => true,
  };

  const [modalState, setModalState] = useState<ModalState>(initialState);



  const callbackRef = useRef<(() => void | Promise<void>) | null>(null);
const formCallbackRef = useRef<((input1: string, input2?: string) => Promise<void>) | null>(null);


  // Function to reset input fields and message
  const resetState = () => {
    setModalState((prevState) => ({
      ...prevState,
      modalTitle: '',
      inputTitle1Text: '',
      inputTitle2Text: '',
      errorMsgInput1: '',
      errorMsgInput2: '',
    }));
  };

  const showModal = (
    message: string,
    title = 'Atención',
    confirmButton = 'Sí, eliminar todo',
    cancelButton = 'Cancelar',
    onClose?: () => void | Promise<void>
  ) => {
    setModalState((prevState) => ({
      ...prevState,
      modalVisible: true,
      modalMessage:message,
      formModalVisible: false, // Regular modal
      modalTitle: title,
      confirmButtonText: confirmButton,
      cancelButtonText: cancelButton,
    }));

    if (onClose) {
      callbackRef.current = onClose;
    }
  };

  const showFormModal = (
    title: string,
    confirmButton: string,
    cancelButton: string,
    onConfirm: (input1: string, input2?: string) => Promise<void>,
    validation1: (input: string) => boolean,
    validation2: (input: string) => boolean,
    errorMsg1 = '',
    errorMsg2 = '',
    inputTitle1 = '',
    inputTitle2 = '',
  ) => {
    resetState();
    
    setModalState((prevState) => ({
      ...prevState,
      modalVisible: false,
      formModalVisible: true,
      modalTitle: title,
      confirmButtonText: confirmButton,
      cancelButtonText: cancelButton,
      inputTitle1Text: inputTitle1,
      inputTitle2Text: inputTitle2,
      errorMsgInput1: errorMsg1,
      errorMsgInput2: errorMsg2,
      validateInput1: validation1,
      validateInput2: validation2,
    }));

    formCallbackRef.current = onConfirm;
  };

  const hideModal = async () => {
    setModalState((prevState) => ({
      ...prevState,
      modalVisible: false,
      formModalVisible: false,
    }));
  };

  const cancelModal = () => {
    hideModal(); 
  };

  const setCallback = (callback: () => void| Promise<void>) => {
    callbackRef.current = callback;
  };

  return (
    <ModalContext.Provider
    value={{
      ...modalState,
      showModal,
      showFormModal,
      hideModal,
      cancelModal,
      setCallback,
      callbackRef,
      formCallbackRef,
    }}
  >
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  return context;
};
