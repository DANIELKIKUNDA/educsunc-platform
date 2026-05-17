import type { StatistiquesClasseReadModel } from '../read-models/StatistiquesClasseReadModel';

// Cette query lit rapidement les statistiques d'une classe.
export interface StatistiquesClasseQuery {
  executer(idClassePedagogique: string, idAnneeScolaire: string, codeColonne: string): Promise<StatistiquesClasseReadModel | null>;
}
