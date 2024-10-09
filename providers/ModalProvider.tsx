import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useRef,
} from 'react';

interface ModalContextType {
  modalVisible: boolean;
  modalMessage: string;
  modalTitle: string;
  confirmButtonText: string;
  cancelButtonText: string;
  showModal: (
    message: string,
    title?: string,
    confirmButtonText?: string,
    cancelButtonText?: string,
  ) => void;
  hideModal: () => void;
  cancelModal: () => void;
  setCallback: (callback: () => void) => void;
}

const ModalContext = createContext<ModalContextType>({
  modalVisible: false,
  modalMessage: '',
  showModal: () => {},
  hideModal: () => {},
  cancelModal: () => {},
  setCallback: () => {},
  modalTitle: '',
  confirmButtonText: '',
  cancelButtonText: '',
});

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider = ({ children }: ModalProviderProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [confirmButtonText, setConfirmButtonText] =
    useState('Sí, eliminar todo');
  const [cancelButtonText, setCancelButtonText] = useState('Cancelar');
  const callbackRef = useRef<() => void | undefined>();

  const showModal = (
    message: string,
    title = 'Atención',
    confirmButton = 'Sí, eliminar todo',
    cancelButton = 'Cancelar',
  ) => {
    setModalMessage(message);
    setModalTitle(title);
    setConfirmButtonText(confirmButton);
    setCancelButtonText(cancelButton);
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
    if (callbackRef.current) {
      callbackRef.current();
    }
  };

  const cancelModal = () => {
    setModalVisible(false);
  };

  const setCallback = (callback: () => void) => {
    callbackRef.current = callback;
  };

  return (
    <ModalContext.Provider
      value={{
        modalVisible,
        modalMessage,
        modalTitle,
        confirmButtonText,
        cancelButtonText,
        showModal,
        hideModal,
        cancelModal,
        setCallback,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

interface UseModalOptions {
  onClose?: () => void;
}

export const useModal = (options?: UseModalOptions) => {
  const context = useContext(ModalContext);
  if (options?.onClose) {
    context.setCallback(options.onClose);
  }
  return context;
};
