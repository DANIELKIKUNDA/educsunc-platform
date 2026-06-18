// Ce port encapsule la verification locale du droit de generation d'une synthese d'ecole.
export interface AutorisationGenerationSynthesePort {
  verifierInitialisationSynthese(params: {
    idUtilisateur: string;
    idOrganisation?: string;
    idEcole: string;
    idAnneeScolaire: string;
    idClassesPedagogiques: string[];
  }): Promise<void>;

  verifierGenerationSynthese(params: {
    idUtilisateur: string;
    idOrganisation?: string;
    idEcole: string;
    idAnneeScolaire: string;
    idClassesPedagogiques: string[];
  }): Promise<void>;
}
