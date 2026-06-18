export interface IdentiteDocumentaireEcolePersistable {
  idEcole: string;
  logoUrl?: string;
  cachetUrl?: string;
  misAJourPar?: string;
}

export interface SignatureDocumentaireUtilisateurPersistable {
  idUtilisateur: string;
  signatureUrl?: string;
  misAJourPar?: string;
}

export interface DepotAssetsRecusPort {
  sauvegarderIdentiteEcole(identite: IdentiteDocumentaireEcolePersistable): Promise<void>;
  consulterIdentiteEcole(idEcole: string): Promise<IdentiteDocumentaireEcolePersistable | null>;
  sauvegarderSignatureUtilisateur(signature: SignatureDocumentaireUtilisateurPersistable): Promise<void>;
  consulterSignatureUtilisateur(idUtilisateur: string): Promise<SignatureDocumentaireUtilisateurPersistable | null>;
}
