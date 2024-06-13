import { DID_QUERY_KEYS } from '@/constants/queryKeys/did';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import didApi from '@/services/did';

const useDidMutation = () => {
  const queryClient = useQueryClient();

  const { mutate, ...rest } = useMutation({
    mutationFn: didApi.createDid,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [DID_QUERY_KEYS.GET_DID],
      });
    },
  });

  return { createDid: mutate, ...rest };
};

export { useDidMutation };
