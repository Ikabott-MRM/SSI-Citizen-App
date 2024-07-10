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
  showModal: (message: string) => void;
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
});

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider = ({ children }: ModalProviderProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const callbackRef = useRef<() => void | undefined>();

  const showModal = (message: string) => {
    setModalMessage(message);
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
