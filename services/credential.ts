import axios from './axios';
import { Credential } from '@/@types/credential';
import { discoverCredentialCidsFromChain } from './credentialChain';

export default {
  /**
   * Gets credentials from backend API (existing flow).
   */
  getCredentials: async (did: string): Promise<Credential[]> => {
    const response = await axios.get<{ data: Credential[] }>(
      '/issuerAgent/credentials',
      {
        params: {
          holderDid: did,
        },
      },
    );
    return response?.data?.data;
  },

  /**
   * Discovers credential CIDs from Rootstock + IPFS (backendless discovery).
   * Note: This only discovers CIDs. Decryption still requires backend in Phase 1.
   */
  discoverCredentialCids: async (did: string): Promise<string[] | null> => {
    return await discoverCredentialCidsFromChain(did);
  },
};
