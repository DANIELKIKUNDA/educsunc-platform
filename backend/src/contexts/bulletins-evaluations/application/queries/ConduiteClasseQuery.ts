import type { ConduiteClasseReadModel } from '../read-models/ConduiteClasseReadModel';

// Cette query lit la liste de conduite d'une classe.
export interface ConduiteClasseQuery {
  executer(idClassePedagogique: string, idAnneeScolaire: string): Promise<ConduiteClasseReadModel>;
}
