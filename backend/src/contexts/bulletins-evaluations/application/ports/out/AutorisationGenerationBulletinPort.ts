// Ce port encapsule la verification locale du droit de generation d'un bulletin.
export interface AutorisationGenerationBulletinPort {
  verifierGenerationBulletin(params: {
    idUtilisateur: string;
    idOrganisation?: string;
    idEcole: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
  }): Promise<void>;
}
