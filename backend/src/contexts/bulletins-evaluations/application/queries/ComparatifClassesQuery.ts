import type { CodeColonneBulletin } from '../../domain/value-objects/CodeColonneBulletin';
import type { ComparatifClasseReadModel } from '../read-models/ComparatifClasseReadModel';

// Ce contrat lit un comparatif de plusieurs classes sur une meme colonne.
export interface ComparatifClassesQuery {
  executer(
    idClassesPedagogiques: string[],
    idAnneeScolaire: string,
    codeColonne: CodeColonneBulletin,
  ): Promise<ComparatifClasseReadModel[]>;
}
