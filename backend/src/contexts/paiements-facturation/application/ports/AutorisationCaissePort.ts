export interface AutorisationCaissePort {
  verifierConsultationCaisse(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
  }): Promise<void>;
  verifierOuvertureCaisse(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
  }): Promise<void>;
  verifierClotureCaisse(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
  }): Promise<void>;
}
