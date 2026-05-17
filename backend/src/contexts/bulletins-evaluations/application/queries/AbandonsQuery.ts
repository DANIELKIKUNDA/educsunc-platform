import type { AbandonReadModel } from '../read-models/AbandonReadModel';

// Cette query lit rapidement la liste des abandons d'une classe.
export interface AbandonsQuery {
  executer(idClassePedagogique: string, idAnneeScolaire: string): Promise<AbandonReadModel[]>;
}
