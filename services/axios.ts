import axios from 'axios';
import { errorCodes } from '@/i18n/errorCodes';

const instance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
});

instance.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (error.response) {
      const status = error.response.status;
      const errorMessage = errorCodes[status]?.es;
      if (errorMessage) {
        error.message = errorMessage;
      }
    }

    return Promise.reject(error);
  },
);

export default instance;
