import { CREDENTIAL_QUERY_KEYS } from '@/constants/queryKeys/credential';
import credential from '@/services/credential';
import { useQuery } from '@tanstack/react-query';
import { getCredentials } from '@/database/db';

const useCredentialsQuery = (
  isConnected: boolean | null,
  did: string,
  queryOptions?: object,
) => {
  const credentials = useQuery({
    // networkMode: 'always',
    enabled: !!did,
    queryKey: [CREDENTIAL_QUERY_KEYS.GET_CREDENTIALS, isConnected, did],
    queryFn: () => credential.getCredentials(did),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    initialData: () => getCredentials(),
    ...queryOptions,
  });

  return { ...credentials, credentials: credentials.data };
};

export { useCredentialsQuery };
