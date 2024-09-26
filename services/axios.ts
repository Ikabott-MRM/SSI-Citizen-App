import axios from 'axios';
import { errorCodes } from '@/i18n/errorCodes';
import { isAxiosError } from 'axios';
import Toast from 'react-native-root-toast';

interface ErrorResponse {
  message: string;
}

const instance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
});

instance.defaults.headers['api_key'] = process.env.EXPO_PUBLIC_API_KEY || '';

instance.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    let errorMessage = 'An unexpected error occurred.';

    if (isAxiosError(error)) {
      const err: ErrorResponse | undefined = error.response?.data;
      const status = error.response?.status;

      const errorMessageFromStatus = status ? errorCodes[status]?.es : '';

      if (errorMessageFromStatus) {
        errorMessage = errorMessageFromStatus;
      } else if (err && err.message) {
        errorMessage = err.message;
      }
    }

    Toast.show(`API Error: ${errorMessage}`, {
      duration: Toast.durations.LONG,
      position: Toast.positions.BOTTOM,
    });

    return Promise.reject(error);
  },
);

export default instance;
