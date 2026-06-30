export interface AutorisationQualificationFinanciereElevePort {
  verifierGestionQualification(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idEleve: string;
  }): Promise<void>;
  verifierConsultationQualification(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idEleve: string;
  }): Promise<void>;
}
