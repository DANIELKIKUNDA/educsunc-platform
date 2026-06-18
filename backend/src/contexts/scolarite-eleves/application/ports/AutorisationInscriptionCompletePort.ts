// Ce fichier definit le port d'autorisation locale de l'inscription scolaire complete.
export interface AutorisationInscriptionCompletePort {
  verifierCreationInscriptionComplete(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
  }): Promise<void>;
}
