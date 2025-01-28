import axios from './axios';
import { Credential } from '@/@types/credential';

export default {
  getCredentials: async (did: string): Promise<Credential[]> => {
    const response = await axios.get<{ data: Credential[] }>(
      '/issuerAgent/credentials',
      {
        params: {
          holderDid: did,
        },
      },
    );
    return response?.data?.data;
  },
};
