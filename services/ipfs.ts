const IPFS_GATEWAY_BASE_URL =
  process.env.EXPO_PUBLIC_IPFS_GATEWAY_BASE_URL ||
  'https://gateway.pinata.cloud/ipfs';

/**
 * Fetches JSON content from IPFS by CID.
 * @param cid The IPFS CID
 * @returns The parsed JSON object, or null on error
 */
export async function fetchJsonFromCid(cid: string): Promise<any | null> {
  try {
    const url = `${IPFS_GATEWAY_BASE_URL}/${cid}`;
    console.log(`[IPFS] Fetching JSON from: ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const json = await response.json();
    console.log(`[IPFS] Successfully fetched JSON for CID: ${cid}`);
    return json;
  } catch (error: any) {
    console.error(
      `[IPFS] Error fetching JSON from CID ${cid}: ${error.message}`,
      error,
    );
    return null;
  }
}

/**
 * Fetches text content from IPFS by CID.
 * @param cid The IPFS CID
 * @returns The text content, or null on error
 */
export async function fetchTextFromCid(cid: string): Promise<string | null> {
  try {
    const url = `${IPFS_GATEWAY_BASE_URL}/${cid}`;
    console.log(`[IPFS] Fetching text from: ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'text/plain',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const text = await response.text();
    console.log(`[IPFS] Successfully fetched text for CID: ${cid}`);
    return text;
  } catch (error: any) {
    console.error(
      `[IPFS] Error fetching text from CID ${cid}: ${error.message}`,
      error,
    );
    return null;
  }
}


