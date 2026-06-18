export interface ConfigurerIdentiteDocumentaireEcoleInput {
  idOrganisation: string;
  idEcole: string;
  idUtilisateur: string;
  roleActif?: string;
  logo?: {
    contenuBase64: string;
    extension: 'png' | 'jpg' | 'jpeg' | 'svg';
  };
  cachet?: {
    contenuBase64: string;
    extension: 'png' | 'jpg' | 'jpeg' | 'svg';
  };
}

export interface ConfigurerSignatureDocumentaireInput {
  idOrganisation: string;
  idEcole: string;
  idUtilisateur: string;
  roleActif?: string;
  signature?: {
    contenuBase64: string;
    extension: 'png' | 'jpg' | 'jpeg' | 'svg';
  };
}

export interface ConsulterAssetRecuInput {
  idOrganisation: string;
  idEcole: string;
  idUtilisateur: string;
  roleActif?: string;
}
