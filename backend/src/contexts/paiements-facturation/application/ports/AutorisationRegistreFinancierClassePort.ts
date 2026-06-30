export interface AutorisationRegistreFinancierClassePort {
  verifierConsultationRegistreFinancierClasse(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
  }): Promise<void>;
}
