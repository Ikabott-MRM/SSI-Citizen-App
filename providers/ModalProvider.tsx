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
  loading: boolean;
  modalMessage: string;
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
  callbackRef: MutableRefObject<(() => void | Promise<void>) | null>;
  formCallbackRef: MutableRefObject<
    ((input1: string, input2?: string) => Promise<void>) | null
  >;
  cancelCallbackRef: MutableRefObject<(() => void | Promise<void>) | null>;
}

interface ModalContextType extends ModalState {
  showModal: (
    message: string,
    title?: string,
    confirmButtonText?: string,
    cancelButtonText?: string,
    onConfirm?: () => void | Promise<void>,
    onCancel?: () => void | Promise<void>,
  ) => void;
  showFormModal: (
    title: string,
    message: string,
    confirmButton: string,
    cancelButton: string,
    onConfirm: (input1: string, input2?: string) => Promise<void>,
    validation1: (input: string) => boolean,
    validation2: (input: string) => boolean,
    onCancel?: () => void | Promise<void>,
    errorMsgInput1?: string,
    errorMsgInput2?: string,
    inputTitle1Text?: string,
    inputTitle2Text?: string,
  ) => void;
  hideModal: () => void;
  setLoading: (value: boolean) => void;
  callbackRef: MutableRefObject<(() => void | Promise<void>) | null>;
  formCallbackRef: MutableRefObject<
    ((input1: string, input2?: string) => Promise<void>) | null
  >;
  cancelCallbackRef: MutableRefObject<(() => void | Promise<void>) | null>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider = ({ children }: ModalProviderProps) => {
  const initialState: ModalState = {
    modalVisible: false,
    loading: false,
    modalMessage: '',
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
    callbackRef: useRef(null),
    formCallbackRef: useRef(null),
    cancelCallbackRef: useRef(null),
  };

  const [modalState, setModalState] = useState<ModalState>(initialState);

  const callbackRef = useRef<(() => void | Promise<void>) | null>(null);
  const formCallbackRef = useRef<
    ((input1: string, input2?: string) => Promise<void>) | null
  >(null);
  const cancelCallbackRef = useRef<(() => void | Promise<void>) | null>(null);

  // Function to reset input fields and message
  const resetState = () => {
    setModalState(prevState => ({
      ...prevState,
      modalTitle: '',
      inputTitle1Text: '',
      inputTitle2Text: '',
      errorMsgInput1: '',
      errorMsgInput2: '',
      loading: false,
    }));
  };

  const setLoading = (value: boolean) => {
    setModalState(prevState => ({
      ...prevState,
      loading: value,
    }));
  };

  const showModal = (
    message: string,
    title = 'Atención',
    confirmButton = 'Sí, eliminar todo',
    cancelButton = 'Cancelar',
    onConfirm?: () => void | Promise<void>,
    onCancel?: () => void | Promise<void>,
  ) => {
    setModalState(prevState => ({
      ...prevState,
      modalVisible: true,
      modalMessage: message,
      formModalVisible: false,
      modalTitle: title,
      confirmButtonText: confirmButton,
      cancelButtonText: cancelButton,
    }));

    if (onConfirm) {
      callbackRef.current = onConfirm;
    }

    if (onCancel) {
      cancelCallbackRef.current = onCancel;
    } else {
      cancelCallbackRef.current = hideModal;
    }
  };

  const showFormModal = (
    title: string,
    message: string,
    confirmButton: string,
    cancelButton: string,
    onConfirm: (input1: string, input2?: string) => Promise<void>,
    validation1: (input: string) => boolean,
    validation2: (input: string) => boolean,
    onCancel?: () => void | Promise<void>,
    errorMsg1 = '',
    errorMsg2 = '',
    inputTitle1 = '',
    inputTitle2 = '',
  ) => {
    resetState();

    setModalState(prevState => ({
      ...prevState,
      modalVisible: false,
      formModalVisible: true,
      modalMessage: message,
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

    if (onCancel) {
      cancelCallbackRef.current = onCancel;
    } else {
      cancelCallbackRef.current = hideModal;
    }
  };

  const hideModal = async () => {
    setModalState(prevState => ({
      ...prevState,
      modalVisible: false,
      formModalVisible: false,
    }));
  };

  return (
    <ModalContext.Provider
      value={{
        ...modalState,
        showModal,
        showFormModal,
        hideModal,
        setLoading,
        callbackRef,
        formCallbackRef,
        cancelCallbackRef,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
