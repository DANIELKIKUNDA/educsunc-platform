// Ce port applique l'autorisation locale du workflow de conduite.
export interface AutorisationConduitePort {
  verifierEncodageConduite(params: {
    idUtilisateur: string;
    idOrganisation?: string;
    idEcole: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
  }): Promise<void>;
}
