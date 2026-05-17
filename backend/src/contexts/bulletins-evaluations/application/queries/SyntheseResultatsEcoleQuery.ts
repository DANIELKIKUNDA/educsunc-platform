import type { SyntheseEcoleOutput } from '../dto/output/SyntheseEcoleOutput';

// Cette query lit rapidement la synthese globale d'une ecole.
export interface SyntheseResultatsEcoleQuery {
  executer(idEcole: string, idAnneeScolaire: string, codeColonne: string): Promise<SyntheseEcoleOutput | null>;
}
