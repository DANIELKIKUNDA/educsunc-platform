import type { CodeColonneBulletin } from '../../domain/value-objects/CodeColonneBulletin';
import type { CoursProblematiqueReadModel } from '../read-models/CoursProblematiqueReadModel';

// Ce contrat lit les cours problematiques d'une classe pour une colonne donnee.
export interface CoursProblematiqueQuery {
  executer(
    idClassePedagogique: string,
    idAnneeScolaire: string,
    codeColonne: CodeColonneBulletin,
    seuilEchec: number,
    seuilEchecProfond: number,
  ): Promise<CoursProblematiqueReadModel[]>;
}
