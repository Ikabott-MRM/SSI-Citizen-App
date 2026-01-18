import { getManifestCid } from './web3Registry';
import { fetchJsonFromCid } from './ipfs';

/**
 * Credential manifest structure (matches backend).
 */
interface DidsCidsAssociation {
  holderDidUri: string;
  cids: string[];
}

interface CredentialManifest {
  issuerDid: string;
  issuedCredentials?: DidsCidsAssociation[];
}

/**
 * Discovers credential CIDs for a holder DID by reading from Rootstock and IPFS.
 * This is the "backendless discovery" flow.
 *
 * @param holderDid The holder's DID URI
 * @returns Array of credential CIDs, or null if not found or on error
 */
export async function discoverCredentialCidsFromChain(
  holderDid: string,
): Promise<string[] | null> {
  try {
    console.log(
      `[CredentialChain] Starting backendless discovery for DID: ${holderDid.substring(0, 20)}...`,
    );

    // Step 1: Read manifest CID from Rootstock
    const manifestCid = await getManifestCid(holderDid);

    if (!manifestCid) {
      console.log(
        `[CredentialChain] No manifest CID found on chain for DID: ${holderDid.substring(0, 20)}...`,
      );
      return null;
    }

    console.log(
      `[CredentialChain] Found manifest CID: ${manifestCid} on chain`,
    );

    // Step 2: Fetch manifest JSON from IPFS
    const manifest: CredentialManifest | null = await fetchJsonFromCid(
      manifestCid,
    );

    if (!manifest) {
      console.error(
        `[CredentialChain] Failed to fetch manifest from IPFS: ${manifestCid}`,
      );
      return null;
    }

    console.log(
      `[CredentialChain] Fetched manifest from IPFS: issuerDid=${manifest.issuerDid}`,
    );

    // Step 3: Find holder's entry in manifest
    if (!manifest.issuedCredentials || manifest.issuedCredentials.length === 0) {
      console.log(
        `[CredentialChain] Manifest has no issued credentials`,
      );
      return [];
    }

    const holderEntry = manifest.issuedCredentials.find(
      (entry) => entry.holderDidUri === holderDid,
    );

    if (!holderEntry) {
      console.log(
        `[CredentialChain] No credentials found for holder DID in manifest`,
      );
      return [];
    }

    const credentialCids = holderEntry.cids || [];

    console.log(
      `[CredentialChain] Discovered ${credentialCids.length} credential CID(s) for holder`,
    );

    return credentialCids;
  } catch (error: any) {
    console.error(
      `[CredentialChain] Error in backendless discovery: ${error.message}`,
      error,
    );
    return null;
  }
}


