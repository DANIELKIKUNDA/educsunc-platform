export interface AutorisationRapportFinancierPort {
  verifierConsultationRapportJournalier(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
  }): Promise<void>;
  verifierConsultationPaiementsParCaissier(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
  }): Promise<void>;
  verifierConsultationSyntheseFinanciereOrganisation(params: {
    idUtilisateur: string;
    idOrganisation: string;
  }): Promise<void>;
}
