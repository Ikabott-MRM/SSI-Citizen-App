import axios from './axios';

export default {
  getRequests: async (did: string) => {
    try {
      const response = await axios.get(`/requests/${did}/requests`);
      return response?.data?.data;
    } catch (e: unknown) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      throw e;
    }
  },
};
