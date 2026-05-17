import type { StatistiquesEcoleReadModel } from '../read-models/StatistiquesEcoleReadModel';

// Cette query lit rapidement les statistiques globales d'une ecole.
export interface StatistiquesEcoleQuery {
  executer(idEcole: string, idAnneeScolaire: string, codeColonne: string): Promise<StatistiquesEcoleReadModel | null>;
}
