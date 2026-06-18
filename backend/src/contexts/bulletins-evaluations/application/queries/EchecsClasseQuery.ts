import type { CodeColonneBulletin } from '../../domain/value-objects/CodeColonneBulletin';
import type { EleveEchecReadModel } from '../read-models/EleveEchecReadModel';

// Ce contrat lit les eleves en echec d'une classe pour une colonne donnee.
export interface EchecsClasseQuery {
  executer(
    idClassePedagogique: string,
    idAnneeScolaire: string,
    codeColonne: CodeColonneBulletin,
    options?: { profondsSeulement?: boolean },
  ): Promise<EleveEchecReadModel[]>;
}
