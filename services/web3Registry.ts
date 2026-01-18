import {
  JsonRpcProvider,
  Contract,
  keccak256,
  toUtf8Bytes,
} from 'ethers';

const CHAIN_ID = parseInt(
  process.env.EXPO_PUBLIC_WEB3_CHAIN_ID || '31',
  10,
);
const RPC_URL = process.env.EXPO_PUBLIC_WEB3_RPC_URL || '';
const CONTRACT_ADDRESS = process.env.EXPO_PUBLIC_WEB3_CONTRACT_ADDRESS || '';

// Minimal ABI for reading manifest CID
const CONTRACT_ABI = [
  'function getManifestCid(bytes32 didKey) external view returns (string memory)',
] as const;

let provider: JsonRpcProvider | null = null;

/**
 * Initializes the Rootstock provider (lazy initialization).
 */
function getProvider(): JsonRpcProvider {
  if (!provider) {
    if (!RPC_URL) {
      throw new Error('EXPO_PUBLIC_WEB3_RPC_URL is not set');
    }
    provider = new JsonRpcProvider(RPC_URL, {
      chainId: CHAIN_ID,
      name: 'rootstock-testnet',
    });
  }
  return provider;
}

/**
 * Derives a stable bytes32 key from a DID URI using keccak256.
 * This matches the contract's expectation for didKey.
 */
export function computeDidKey(did: string): string {
  return keccak256(toUtf8Bytes(did));
}

/**
 * Retrieves the manifest CID for a given DID from Rootstock.
 * @param did The DID URI
 * @returns The manifest CID, or null if not found or on error
 */
export async function getManifestCid(did: string): Promise<string | null> {
  try {
    if (!CONTRACT_ADDRESS) {
      console.warn(
        'EXPO_PUBLIC_WEB3_CONTRACT_ADDRESS is not set, cannot read from Rootstock',
      );
      return null;
    }

    const didKey = computeDidKey(did);
    const rpcProvider = getProvider();

    // Create a read-only contract instance
    const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, rpcProvider);

    console.log(
      `[Web3Registry] Reading manifest CID: didKey=${didKey}, contract=${CONTRACT_ADDRESS}, chainId=${CHAIN_ID}`,
    );

    const manifestCid = await contract.getManifestCid(didKey);

    if (!manifestCid || manifestCid.length === 0) {
      console.log(
        `[Web3Registry] No manifest CID found for DID: ${did.substring(0, 20)}...`,
      );
      return null;
    }

    console.log(
      `[Web3Registry] Found manifest CID: ${manifestCid} for DID: ${did.substring(0, 20)}...`,
    );

    return manifestCid;
  } catch (error: any) {
    console.error(
      `[Web3Registry] Error reading manifest CID from Rootstock: ${error.message}`,
      error,
    );
    return null;
  }
}

