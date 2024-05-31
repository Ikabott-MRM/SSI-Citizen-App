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
      const response = await axios.post(
        `/identity/${did}/documents`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      return response?.data?.data;
    } catch (e: unknown) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      throw e?.response?.data;
    }
  },
};
