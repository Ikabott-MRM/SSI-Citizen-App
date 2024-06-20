import { useMutation } from '@tanstack/react-query';
import didApi from '@/services/did';

const useDidMutation = () => {
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: () => didApi.createDid(),
  });

  return { createDid: mutateAsync, ...rest };
};

export { useDidMutation };
