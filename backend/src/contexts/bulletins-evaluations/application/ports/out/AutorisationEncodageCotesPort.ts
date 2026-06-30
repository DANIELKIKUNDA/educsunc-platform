export interface AutorisationEncodageCotesPort {
  verifierConsultationFichesClasseCours(params: {
    idUtilisateur: string;
    idOrganisation?: string;
    idEcole: string;
    idClassePedagogique: string;
    idReferentielCours: string;
    idAnneeScolaire: string;
  }): Promise<void>;

  verifierEncodageCotes(params: {
    idUtilisateur: string;
    idOrganisation?: string;
    idEcole: string;
    idClassePedagogique: string;
    idReferentielCours: string;
    idAnneeScolaire: string;
  }): Promise<void>;
}
