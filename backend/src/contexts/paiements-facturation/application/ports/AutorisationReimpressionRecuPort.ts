export interface AutorisationReimpressionRecuPort {
  verifierReimpressionRecu(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
  }): Promise<void>;
}
