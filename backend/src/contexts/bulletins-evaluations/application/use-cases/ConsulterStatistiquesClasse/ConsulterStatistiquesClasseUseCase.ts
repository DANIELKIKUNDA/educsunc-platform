import type { ConsulterStatistiquesClasseInput } from '../../dto/input/ConsulterStatistiquesClasseInput';
import { QueryException } from '../../exceptions/QueryException';
import type { AutorisationConsultationStatistiquesPort } from '../../ports/out/AutorisationConsultationStatistiquesPort';
import type { StatistiquesClasseQuery } from '../../queries/StatistiquesClasseQuery';
import type { StatistiquesClasseReadModel } from '../../read-models/StatistiquesClasseReadModel';

// Ce use case encapsule la lecture autorisee des statistiques d'une classe.
export class ConsulterStatistiquesClasseUseCase {
  constructor(
    private readonly query: StatistiquesClasseQuery,
    private readonly autorisationConsultationStatistiquesPort?: AutorisationConsultationStatistiquesPort,
  ) {}

  public async executer(input: ConsulterStatistiquesClasseInput): Promise<StatistiquesClasseReadModel> {
    await this.autorisationConsultationStatistiquesPort?.verifierConsultationStatistiquesClasse({
      idUtilisateur: input.idUtilisateur,
      idOrganisation: input.idOrganisation,
      idEcole: input.idEcole,
      idClassePedagogique: input.idClassePedagogique,
      idAnneeScolaire: input.idAnneeScolaire,
    });

    const statistiques = await this.query.executer(
      input.idClassePedagogique,
      input.idAnneeScolaire,
      input.codeColonne,
    );
    if (statistiques === null) {
      throw new QueryException('Les statistiques de classe demandees sont introuvables.');
    }

    return statistiques;
  }
}
