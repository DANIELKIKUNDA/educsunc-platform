export interface AutorisationHistoriquePaiementsPort {
  verifierConsultationHistoriquePaiements(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idEleve: string;
  }): Promise<void>;
}
