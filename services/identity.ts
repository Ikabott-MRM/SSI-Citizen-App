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
      console.log(e);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      throw e?.response?.data;
    }
  },
};
