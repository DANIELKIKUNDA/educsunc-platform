export interface AutorisationConsultationRecusPort {
  verifierConsultationRecus(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
  }): Promise<void>;
}
