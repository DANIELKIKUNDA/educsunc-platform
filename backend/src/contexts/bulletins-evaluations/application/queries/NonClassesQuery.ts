import type { NonClasseReadModel } from '../read-models/NonClasseReadModel';

// Cette query lit rapidement la liste des non classes d'une classe.
export interface NonClassesQuery {
  executer(idClassePedagogique: string, idAnneeScolaire: string, codeColonne: string): Promise<NonClasseReadModel[]>;
}
