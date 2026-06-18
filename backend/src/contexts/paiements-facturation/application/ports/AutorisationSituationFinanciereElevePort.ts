export interface AutorisationSituationFinanciereElevePort {
  verifierConsultationSituationFinanciereEleve(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idEleve: string;
  }): Promise<void>;
}
