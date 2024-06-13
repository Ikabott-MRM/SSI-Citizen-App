import { useMutation } from '@tanstack/react-query';
import didApi from '@/services/identity';

const useIdentityMutation = () => {
  const { mutate, ...rest } = useMutation({
    mutationFn: didApi.uploadDocumentFile,
  });

  return { uploadDocumentFile: mutate, ...rest };
};

export { useIdentityMutation };
