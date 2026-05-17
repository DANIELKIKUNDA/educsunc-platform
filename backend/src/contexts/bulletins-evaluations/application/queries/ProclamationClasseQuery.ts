import type { ProclamationClasseReadModel } from '../read-models/ProclamationClasseReadModel';

// Cette query lit rapidement une proclamation complete de classe.
export interface ProclamationClasseQuery {
  executer(idClassePedagogique: string, idAnneeScolaire: string, codeColonne: string): Promise<ProclamationClasseReadModel | null>;
}
