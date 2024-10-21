import axios from './axios';

interface BackUpEmailInfo {
  to: string;
  jsonContent: {
    salt: string;
    iv: string;
    encryptedData: string;
  };
  verificationCode: string;
}
export default {
  sendMail: async ({
    backUpEmailInfo,
  }: {
    backUpEmailInfo: BackUpEmailInfo;
  }) => {
    const response = await axios.post(`/email/back-up`, backUpEmailInfo, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log(response?.data);
    return response?.data?.data;
  },
};
