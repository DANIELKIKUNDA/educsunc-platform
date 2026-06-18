import type { CodeColonneBulletin } from '../../domain/value-objects/CodeColonneBulletin';
import type { EligibilitePerequationReadModel } from '../read-models/EligibilitePerequationReadModel';

// Ce contrat lit les eleves eligibles a la perequation pour une classe.
export interface EligibilitePerequationQuery {
  executer(
    idClassePedagogique: string,
    idAnneeScolaire: string,
    codeColonne: CodeColonneBulletin,
  ): Promise<EligibilitePerequationReadModel[]>;
}
