import requestsApi from '@/services/requests';
import { useQuery } from '@tanstack/react-query';
import { REQUESTS_QUERY_KEYS } from '@/constants/queryKeys/requests';

const useRequestsQuery = (did: string, queryOptions?: object) => {
  const requests = useQuery({
    // networkMode: 'always',
    enabled: !!did,
    queryKey: [REQUESTS_QUERY_KEYS.GET_REQUESTS],
    queryFn: () => requestsApi.getRequests(did),
    ...queryOptions,
  });

  return { ...requests, requests: requests.data };
};

export { useRequestsQuery };
