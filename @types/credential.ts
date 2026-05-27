interface CredentialSubject {
  id: string;
  firstname?: string;
  lastname?: string;
  licenseCategory?: string;
  tipo?: string;
  cantidad?: string;
  precio?: string;
  fechaEntrega?: string;
}

interface VcDataModel {
  '@context': string[];
  type: string[];
  id: string;
  issuer: string;
  issuanceDate: string;
  credentialSubject: CredentialSubject;
  expirationDate?: string;
}

interface VerifiableCredential {
  vcDataModel: VcDataModel;
}

export interface Credential {
  vcJwt: string;
  verifiableCredential: VerifiableCredential;
}
