import type { DiagnosticEchecReadModel } from '../read-models/DiagnosticEchecReadModel';

// Cette query lit rapidement les diagnostics d'echec d'un eleve.
export interface DiagnosticEchecQuery {
  executer(idEleve: string, idAnneeScolaire: string): Promise<DiagnosticEchecReadModel[]>;
}
