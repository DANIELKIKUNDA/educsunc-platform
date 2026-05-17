import type { ConsulterSyntheseInput } from '../../dto/input/ConsulterSyntheseInput';
import type { SyntheseEcoleOutput } from '../../dto/output/SyntheseEcoleOutput';
import { QueryException } from '../../exceptions/QueryException';
import type { SyntheseResultatsEcoleQuery } from '../../queries/SyntheseResultatsEcoleQuery';

// Ce use case expose la lecture optimisee d'une synthese de resultats ecole.
export class ConsulterSyntheseResultatsUseCase {
  constructor(private readonly query: SyntheseResultatsEcoleQuery) {}

  // Cette methode retourne la synthese demandee ou echoue proprement.
  public async executer(input: ConsulterSyntheseInput): Promise<SyntheseEcoleOutput> {
    const synthese = await this.query.executer(input.idEcole, input.idAnneeScolaire, input.codeColonne);
    if (synthese === null) {
      throw new QueryException('La synthese demandee est introuvable.');
    }

    return synthese;
  }
}
