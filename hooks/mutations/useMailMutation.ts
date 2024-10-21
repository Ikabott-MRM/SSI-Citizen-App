import { useMutation } from '@tanstack/react-query';
import didApi from '../../services/mail';

const useMailMutation = () => {
  const { mutate, ...rest } = useMutation({
    mutationFn: didApi.sendMail,
  });

  return { sendMail: mutate, ...rest };
};

export { useMailMutation };
