import type { CodeColonneBulletin } from '../../domain/value-objects/CodeColonneBulletin';
import type { EligibiliteRepechageReadModel } from '../read-models/EligibiliteRepechageReadModel';

// Ce contrat lit les eleves eligibles au repechage pour une classe.
export interface EligibiliteRepechageQuery {
  executer(
    idClassePedagogique: string,
    idAnneeScolaire: string,
    codeColonne: CodeColonneBulletin,
  ): Promise<EligibiliteRepechageReadModel[]>;
}
