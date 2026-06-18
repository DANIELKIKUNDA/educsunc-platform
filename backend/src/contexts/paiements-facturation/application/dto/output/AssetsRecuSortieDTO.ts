export interface IdentiteDocumentaireEcoleOutput {
  idEcole: string;
  logoUrl?: string;
  cachetUrl?: string;
}

export interface SignatureDocumentaireUtilisateurOutput {
  idUtilisateur: string;
  signatureUrl?: string;
}

export interface FichierAssetRecuOutput {
  nomFichier: string;
  mimeType: string;
  contenu: Buffer;
}
