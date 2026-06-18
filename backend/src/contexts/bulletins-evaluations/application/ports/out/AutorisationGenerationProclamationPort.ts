// Ce port encapsule la verification locale du droit de generation d'une proclamation de classe.
export interface AutorisationGenerationProclamationPort {
  verifierInitialisationProclamation(params: {
    idUtilisateur: string;
    idOrganisation?: string;
    idEcole: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
  }): Promise<void>;

  verifierGenerationProclamation(params: {
    idUtilisateur: string;
    idOrganisation?: string;
    idEcole: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
  }): Promise<void>;
}
