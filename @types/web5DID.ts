interface Document {
  assertionMethod: string[];
  authentication: string[];
  capabilityDelegation: string[];
  capabilityInvocation: string[];
  id: string;
  verificationMethod: unknown[];
}

interface Metadata {
  published: boolean;
  versionId: string;
}



export interface Web5DID {
  document: Document;
  privateKeys: object[];
  metadata: Metadata;
  uri: string;
}
