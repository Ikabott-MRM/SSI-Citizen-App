import { BackUpEmailInfo } from '@/services/mail';
import { UseMutateFunction } from '@tanstack/react-query';
import { Alert } from 'react-native';
import Toast from 'react-native-root-toast';
import { generateRandomCode, validateEmail, validatePwd } from './helpers';
import { encryptData } from '@/services/encryptionService';
import { useEffect } from 'react';
import { useDid } from '@/providers/DidProvider';
import { useModal } from '@/providers/ModalProvider';

type HandleDidBackupParams = {
    input1: string;
    input2?: string;
    encryptData: (data: string, password: string) =>  Promise<{
        iv: string;
        encryptedData: string;
        salt: string;
    } | undefined>
    // generateRandomCode: () => string;
    sendMail: UseMutateFunction<any, Error, {
        backUpEmailInfo: BackUpEmailInfo;
    }, unknown>
    setVerificationCode: (code: string) => void;
    setLoading: (loading: boolean) => void;
    t: (key: string) => string;
    portableDid: string;
  };

  type HandleDeclineDidBackupParams = {
    setIsBackupDeclined:(value: boolean) => void;
    setVerificationCode: (code: string) => void;
    resetVCodeAttempts: () => void;
    t: (key: string) => string;
    hideModal:()=>void;
  };
  
  export const declineDidBackup = ({t,setIsBackupDeclined,resetVCodeAttempts,setVerificationCode,hideModal}:HandleDeclineDidBackupParams): void => {
    Alert.alert(
      t('Your DID won’t be backed up.'),
      t(
        'By pressing `Understood` and leaving this step incomplete, you are choosing not to back up your DID. Your DID will remain unbacked up until you restart the backup process.',
      ),
      [
        {
          text: t('Understood'),
          onPress: () => {
            setIsBackupDeclined(true);
            resetVCodeAttempts();
            // setVCodeAttempts(0);
            setVerificationCode('');
            hideModal();
          },
        },
      ],
      { cancelable: true },
    );
  };

  export const useVCodeAttempts = (t: (key: string) => string, hideModal: () => void) => {
    const { vCodeAttempts, resetVCodeAttempts, setVerificationCode } = useDid();
    useEffect(() => {
      if (vCodeAttempts >= 3) {
        showInvalidCodeAlert({ t, hideModal, resetVCodeAttempts, setVerificationCode });
      }
    }, [vCodeAttempts, t, hideModal, resetVCodeAttempts, setVerificationCode]);
  };

  type UseVerificationCodeHookParams = {
    // verificationCode: string;
    // isBackupCompleted: boolean;
    // hideModal: () => void;
    // setLoading: (loading: boolean) => void;
    // showFormModal: (
    //   title: string,
    //   message: string,
    //   confirmText: string,
    //   cancelText: string,
    //   onConfirm: () => Promise<void>,
    //   validateInput: (input: string) => boolean,
    //   onInputValidationSuccess: () => boolean,
    //   onCancel: () => void,
    //   invalidMessage: string,
    //   placeholder?: string,
    //   additionalText?: string
    // ) => void;
    verifyCode:(input1: string) => Promise<void>;
    validateFiveDigitCode: (input: string) => boolean;
    // declineDidBackup: (params: {
    //   t: (key: string) => string;
    //   setIsBackupDeclined: (declined: boolean) => void;
    //   resetVCodeAttempts: () => void;
    //   setVerificationCode: (code: string) => void;
    //   hideModal: () => void;
    // }) => void;
    t: (key: string) => string;
  };
  
  export const useVerificationCode = ({
    // verificationCode,
    // isBackupCompleted,
    // setLoading,
    // showFormModal,
    verifyCode,
    validateFiveDigitCode,
    // declineDidBackup,
    t,
  }: UseVerificationCodeHookParams) => {
    const { setIsBackupDeclined, verificationCode,isBackupCompleted, resetVCodeAttempts, setVerificationCode } = useDid();
    const {hideModal,showFormModal, setLoading} = useModal();
    useEffect(() => {
      if (verificationCode && !isBackupCompleted) {
        setLoading(false);
        showFormModal(
          t('Backup code'),
          t('Enter the code you have just received by email.'),
          t('Verify'),
          t('Cancel'),
          verifyCode,
          validateFiveDigitCode,
          () => true,
          () =>
            declineDidBackup({
              t,
              setIsBackupDeclined,
              resetVCodeAttempts,
              setVerificationCode,
              hideModal,
            }),
          t('The code must be five digits.'),
          undefined,
          t('Code'),
          ''
        );
      }
      //TODO revisar si preciso todas esas dependencias en estos custom Hooks
    }, [verificationCode, isBackupCompleted, setLoading, showFormModal, verifyCode, validateFiveDigitCode, declineDidBackup, t]);
  };

  export const showInvalidCodeAlert = ({t,hideModal,resetVCodeAttempts,setVerificationCode}:{
    setVerificationCode: (code: string) => void;
    resetVCodeAttempts: () => void;
    t: (key: string) => string;
    hideModal:()=>void;
  }) => {
    Alert.alert(
      t('Invalid verification code'),
      t(
        'You have reached the maximum attempts for entering an invalid code. Please restart the backup process if you want to mark it as completed.',
      ),
      [
        {
          text: t('Understood'),
          onPress: () => {
            hideModal();
            resetVCodeAttempts();
            // setVCodeAttempts(0);
            setVerificationCode('');
          },
        },
      ],
      { cancelable: false },
    );
  };

  export const handleDidBackup = async ({
    input1,
    input2,
    encryptData,
    // generateRandomCode,
    sendMail,
    setVerificationCode,
    setLoading,
    t,
    portableDid,
  }: HandleDidBackupParams): Promise<void> => {
    setLoading(true);
  
    const encryptedPortableDid = await encryptData(portableDid, input2 || '');
    const verificationCode = generateRandomCode();
  
    if (!encryptedPortableDid) {
      Toast.show(t('Encryption failed. Please try again.'), {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
      });
      setLoading(false);
      return;
    }
  
    const backUpEmailInfo = {
      to: input1,
      jsonContent: {
        salt: encryptedPortableDid.salt,
        iv: encryptedPortableDid.iv,
        encryptedData: encryptedPortableDid.encryptedData,
      },
      verificationCode,
    };
  
    sendMail(
      { backUpEmailInfo },
      {
        onSuccess: () => {
          Toast.show(t('Back up mail successfully sent. Check your inbox'), {
            duration: Toast.durations.LONG,
            position: Toast.positions.BOTTOM,
          });
          setVerificationCode(verificationCode);
          setLoading(false);
        },
        onError: (error: string | Error) => {
          Alert.alert(
            t('Error sending back up mail'),
            t('An error occurred while trying to send the mail for DID back up. Please review the email address you have entered and try again.'),
            [{ text: 'Ok' }],
            { cancelable: false }
          );
          setLoading(false);
          if (typeof error === 'string') {
            Toast.show(error, {
              duration: Toast.durations.LONG,
              position: Toast.positions.BOTTOM,
            });
          }
        },
      }
    );
  };

export const promptDidBackup1 =  (
    t: (key: string) => string,
    handleDidBackup: (input1: string, input2?: string) => Promise<void>,
    // validateEmail: (input: string) => boolean,
    // validatePwd: (input: string) => boolean,
    declineDidBackup: () => void,
    showModal: (
      title: string,
      message: string,
      confirmText: string,
      cancelText: string,
      onConfirm: () => void,
      onCancel?: () => void,
    ) => void,
    showFormModal: (
      title: string,
      message: string,
      confirmText: string,
      cancelText: string,
      onConfirm: (input1: string, input2?: string | undefined) => Promise<void>,
      validateInput1: (input: string) => boolean,
      validateInput2: (input: string) => boolean,
      onCancel: () => void,
      invalidMessage1?: string,
      invalidMessage2?: string,
      placeholder1?: string,
      placeholder2?: string,
    ) => void
  ) => {
    showModal(
      t('Do you want to backup your DID?'),
      t(''),
      t('Yes'),
      t('No'),
      () => {
        showFormModal(
          t('DID Backup'),
          t(
            "Please enter the email address where you'd like to receive your backup, along with a password for encryption.",
          ),
          t('Backup'),
          t('Cancel'),
          handleDidBackup,
          validateEmail,
          validatePwd,
          declineDidBackup,
          t('Invalid email'),
          t(
            'Invalid password.\nPassword must be 8 alphanumeric characters and contain at least one number.',
          ),
          t('Email'),
          t('Password'),
        );
      },
      declineDidBackup,
    );
  };


  export const promptDidBackup = (
    t: (key: string) => string,
    // encryptData: (data: string, password: string) => Promise<{ iv: string; encryptedData: string; salt: string } | undefined>,
    sendMail: UseMutateFunction<any, Error, { backUpEmailInfo: BackUpEmailInfo }, unknown>,
    setVerificationCode: (code: string) => void,
    resetVCodeAttempts: () => void,
    hideModal:()=>void,
    setIsBackupDeclined:(value:boolean)=>void,
    setLoading: (loading: boolean) => void,
    portableDid: string,
    // declineDidBackup: () => void,
    showModal: (
        title: string,
        message: string,
        confirmText: string,
        cancelText: string,
        onConfirm: () => void,
        onCancel?: () => void
    ) => void,
    showFormModal: (
        title: string,
        message: string,
        confirmText: string,
        cancelText: string,
        onConfirm: (input1: string, input2?: string | undefined) => Promise<void>,
        validateInput1: (input: string) => boolean,
        validateInput2: (input: string) => boolean,
        onCancel: () => void,
        invalidMessage1?: string,
        invalidMessage2?: string,
        placeholder1?: string,
        placeholder2?: string
    ) => void
) => {
    showModal(
        t('Do you want to backup your DID?'),
        t(''),
        t('Yes'),
        t('No'),
        () => {
            showFormModal(
                t('DID Backup'),
                t("Please enter the email address where you'd like to receive your backup, along with a password for encryption."),
                t('Backup'),
                t('Cancel'),
                (input1, input2) =>
                    handleDidBackup({
                        input1,
                        input2,
                        encryptData,
                        sendMail,
                        setVerificationCode,
                        setLoading,
                        t,
                        portableDid,
                    }),
                validateEmail,
                validatePwd,
                ()=>declineDidBackup({t,setIsBackupDeclined,resetVCodeAttempts,setVerificationCode,hideModal}),
                t('Invalid email'),
                t('Invalid password.\nPassword must be 8 alphanumeric characters and contain at least one number.'),
                t('Email'),
                t('Password')
            );
        },
        ()=>declineDidBackup({t,setIsBackupDeclined,resetVCodeAttempts,setVerificationCode,hideModal}),
    );
};