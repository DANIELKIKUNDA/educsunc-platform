import type { ConsulterAbandonsInput } from '../../dto/input/ConsulterAbandonsInput';
import type { AutorisationConsultationStatistiquesPort } from '../../ports/out/AutorisationConsultationStatistiquesPort';
import type { AbandonsQuery } from '../../queries/AbandonsQuery';
import type { AbandonReadModel } from '../../read-models/AbandonReadModel';

// Ce use case encapsule la lecture autorisee des abandons exposes dans une classe.
export class ConsulterAbandonsUseCase {
  constructor(
    private readonly query: AbandonsQuery,
    private readonly autorisationConsultationStatistiquesPort?: AutorisationConsultationStatistiquesPort,
  ) {}

  public async executer(input: ConsulterAbandonsInput): Promise<AbandonReadModel[]> {
    await this.autorisationConsultationStatistiquesPort?.verifierConsultationStatistiquesClasse({
      idUtilisateur: input.idUtilisateur,
      idOrganisation: input.idOrganisation,
      idEcole: input.idEcole,
      idClassePedagogique: input.idClassePedagogique,
      idAnneeScolaire: input.idAnneeScolaire,
    });

    return this.query.executer(input.idClassePedagogique, input.idAnneeScolaire);
  }
}
