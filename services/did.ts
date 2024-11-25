import axios from './axios';
import { Web5DID } from '@/@types/web5DID';

export default {
  createDid: async (): Promise<Web5DID> => {
    const response = await axios.post<{ data: Web5DID }>('/issuerAgent/did');
    return response?.data?.data;
  },
};
