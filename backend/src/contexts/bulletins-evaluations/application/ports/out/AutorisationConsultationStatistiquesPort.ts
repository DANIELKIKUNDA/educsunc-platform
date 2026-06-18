// Ce port verifie localement les droits de consultation des statistiques pedagogiques.
export interface AutorisationConsultationStatistiquesPort {
  verifierConsultationStatistiquesClasse(params: {
    idUtilisateur: string;
    idOrganisation?: string;
    idEcole: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
  }): Promise<void>;

  verifierConsultationStatistiquesEcole(params: {
    idUtilisateur: string;
    idOrganisation?: string;
    idEcole: string;
    idAnneeScolaire: string;
  }): Promise<void>;
}
