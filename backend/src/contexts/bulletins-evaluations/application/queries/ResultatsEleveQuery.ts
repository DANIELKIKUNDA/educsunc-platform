import type { ResultatBulletinOutput } from '../dto/output/ResultatBulletinOutput';

// Cette query lit rapidement les resultats consolides d'un eleve.
export interface ResultatsEleveQuery {
  executer(idEleve: string, idAnneeScolaire: string): Promise<ResultatBulletinOutput | null>;
}
