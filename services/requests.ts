import axios from './axios';

export default {
  getRequests: async (did: string) => {
    const response = await axios.get(`/requests/${did}/requests`);
    return response?.data?.data;
  },
};
