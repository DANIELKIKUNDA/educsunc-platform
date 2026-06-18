// Ce port verrouille la lecture d'un bulletin reel selon l'acteur et son perimetre metier.
export interface AutorisationLectureBulletinPort {
  verifierLectureBulletin(params: {
    idUtilisateur: string;
    idOrganisation?: string;
    idEcole: string;
    idEleve: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
  }): Promise<void>;
}
