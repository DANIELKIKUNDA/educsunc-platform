import type { CodeColonneBulletin } from '../../domain/value-objects/CodeColonneBulletin';
import type { EvolutionResultatReadModel } from '../read-models/EvolutionResultatReadModel';

// Ce contrat lit l'evolution historisee d'un resultat consolide.
export interface EvolutionResultatQuery {
  executer(
    idEleve: string,
    idAnneeScolaire: string,
    codeColonne?: CodeColonneBulletin,
  ): Promise<EvolutionResultatReadModel[]>;
}
