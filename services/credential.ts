import axios from './axios';
import { Credential } from '@/@types/credential';

export default {
  getCredentials: async (did: string): Promise<Credential[]> => {
    try {
      const response = await axios.get<{ data: Credential[] }>(
        '/dwn/credentials',
        {
          params: {
            holderDid: did,
          },
        },
      );
      return response?.data?.data;
    } catch (e: unknown) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      throw e?.message;
    }
  },
};
