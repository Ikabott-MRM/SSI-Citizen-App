import axios from './axios';

export default {
  uploadDocumentFile: async ({
    did,
    formData,
  }: {
    did: string;
    formData: FormData;
  }) => {
    const response = await axios.post(`/requests/${did}/request`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response?.data?.data;
  },
};
