import axios from './axios';

export default {
  uploadDocumentFile: async ({
    did,
    formData,
  }: {
    did: string;
    formData: FormData;
  }) => {
    try {
      const response = await axios.post(`/requests/${did}/request`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response?.data?.data;
    } catch (e: unknown) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      throw e;
    }
  },
};
