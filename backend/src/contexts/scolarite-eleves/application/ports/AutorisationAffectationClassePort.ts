// Ce port reapplique la doctrine locale permission + perimetre pour les affectations de classe.
export interface AutorisationAffectationClassePort {
  verifierCreationAffectationClasse(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idInscriptionScolaire: string;
    idClassePedagogique: string;
  }): Promise<void>;
  verifierChangementClasse(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idInscriptionScolaire: string;
    idNouvelleClassePedagogique: string;
  }): Promise<void>;
  verifierDesactivationAffectationClasse(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idInscriptionScolaire: string;
  }): Promise<void>;
  verifierConsultationAffectationClasse(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idInscriptionScolaire: string;
  }): Promise<void>;
  verifierConsultationClassePedagogique(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idClassePedagogique: string;
  }): Promise<void>;
}
