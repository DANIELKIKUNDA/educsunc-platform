// Ce port verrouille localement la consultation et le recalcul d'un classement de classe.
export interface AutorisationClassementPort {
  verifierConsultationClassementClasse(params: {
    idUtilisateur: string;
    idOrganisation?: string;
    idEcole: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
  }): Promise<void>;

  verifierRecalculClassementClasse(params: {
    idUtilisateur: string;
    idOrganisation?: string;
    idEcole: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
  }): Promise<void>;
}
