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

interface KeyManager {
  _algorithmInstances: unknown;
  _keyStore: {
    store: unknown;
  };
}

export interface Web5DID {
  document: Document;
  keyManager: KeyManager;
  metadata: Metadata;
  uri: string;
}
