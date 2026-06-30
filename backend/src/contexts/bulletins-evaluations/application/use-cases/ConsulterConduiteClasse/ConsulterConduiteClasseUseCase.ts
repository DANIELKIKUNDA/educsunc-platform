import type { ConduiteClasseReadModel } from '../../read-models/ConduiteClasseReadModel';
import type { ConsulterConduiteClasseInput } from '../../dto/input/ConsulterConduiteClasseInput';
import type { AutorisationConduitePort } from '../../ports/out/AutorisationConduitePort';
import type { ConduiteClasseQuery } from '../../queries/ConduiteClasseQuery';

// Ce use case expose la lecture de conduite d'une classe.
export class ConsulterConduiteClasseUseCase {
  constructor(
    private readonly query: ConduiteClasseQuery,
    private readonly autorisationConduitePort?: AutorisationConduitePort,
  ) {}

  public async executer(input: ConsulterConduiteClasseInput): Promise<ConduiteClasseReadModel> {
    await this.autorisationConduitePort?.verifierEncodageConduite({
      idUtilisateur: input.idUtilisateur,
      idOrganisation: input.idOrganisation,
      idEcole: input.idEcole,
      idClassePedagogique: input.idClassePedagogique,
      idAnneeScolaire: input.idAnneeScolaire,
    });

    return this.query.executer(input.idClassePedagogique, input.idAnneeScolaire);
  }
}
