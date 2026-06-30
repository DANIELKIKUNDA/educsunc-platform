import type { ApplicationConduiteOutput } from '../dto/output/ApplicationConduiteOutput';

// Ce read model represente la liste de conduite d'une classe pour l'UI d'encodage.
export interface ConduiteClasseReadModel {
  idClassePedagogique: string;
  idAnneeScolaire: string;
  lignes: LigneConduiteClasseReadModel[];
}

export interface LigneConduiteClasseReadModel {
  idResultatBulletinEleve: string;
  idEleve: string;
  nomComplet: string;
  sexe?: string;
  applications: ApplicationConduiteOutput[];
}
