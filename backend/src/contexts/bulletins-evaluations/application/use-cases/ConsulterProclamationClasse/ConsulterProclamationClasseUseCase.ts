import type { ConsulterProclamationInput } from '../../dto/input/ConsulterProclamationInput';
import type { ProclamationClasseOutput } from '../../dto/output/ProclamationClasseOutput';
import { QueryException } from '../../exceptions/QueryException';
import type { ProclamationClasseQuery } from '../../queries/ProclamationClasseQuery';

// Ce use case expose la lecture optimisee d'une proclamation de classe.
export class ConsulterProclamationClasseUseCase {
  constructor(private readonly query: ProclamationClasseQuery) {}

  // Cette methode retourne la proclamation demandee ou echoue proprement.
  public async executer(input: ConsulterProclamationInput): Promise<ProclamationClasseOutput> {
    const proclamation = await this.query.executer(input.idClassePedagogique, input.idAnneeScolaire, input.codeColonne);
    if (proclamation === null) {
      throw new QueryException('La proclamation demandee est introuvable.');
    }

    return proclamation;
  }
}
