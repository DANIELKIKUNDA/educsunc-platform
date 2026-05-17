import type { ClassementClasseReadModel } from '../read-models/ClassementClasseReadModel';

// Cette query lit rapidement un classement de classe sur une colonne.
export interface ClassementClasseQuery {
  executer(idClassePedagogique: string, idAnneeScolaire: string, codeColonne: string): Promise<ClassementClasseReadModel | null>;
}
