import axios from './axios';
import { Web5DID } from '@/@types/web5DID';

export default {
  createDid: async (): Promise<Web5DID> => {
    try {
      const response = await axios.post<{ data: Web5DID }>('/issuerAgent/did');
      return response?.data?.data;
    } catch (e: unknown) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      throw e?.response?.data;
    }
  },
};
