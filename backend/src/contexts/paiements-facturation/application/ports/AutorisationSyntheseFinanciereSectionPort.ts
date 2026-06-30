export interface AutorisationSyntheseFinanciereSectionPort {
  verifierConsultationSyntheseFinanciereSection(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idSectionScolaire: string;
  }): Promise<void>;
}
