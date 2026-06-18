import type { ConsulterStatistiquesEcoleInput } from '../../dto/input/ConsulterStatistiquesEcoleInput';
import { QueryException } from '../../exceptions/QueryException';
import type { AutorisationConsultationStatistiquesPort } from '../../ports/out/AutorisationConsultationStatistiquesPort';
import type { StatistiquesEcoleQuery } from '../../queries/StatistiquesEcoleQuery';
import type { StatistiquesEcoleReadModel } from '../../read-models/StatistiquesEcoleReadModel';

// Ce use case encapsule la lecture autorisee des statistiques globales d'une ecole.
export class ConsulterStatistiquesEcoleUseCase {
  constructor(
    private readonly query: StatistiquesEcoleQuery,
    private readonly autorisationConsultationStatistiquesPort?: AutorisationConsultationStatistiquesPort,
  ) {}

  public async executer(input: ConsulterStatistiquesEcoleInput): Promise<StatistiquesEcoleReadModel> {
    await this.autorisationConsultationStatistiquesPort?.verifierConsultationStatistiquesEcole({
      idUtilisateur: input.idUtilisateur,
      idOrganisation: input.idOrganisation,
      idEcole: input.idEcole,
      idAnneeScolaire: input.idAnneeScolaire,
    });

    const statistiques = await this.query.executer(
      input.idEcole,
      input.idAnneeScolaire,
      input.codeColonne,
    );
    if (statistiques === null) {
      throw new QueryException('Les statistiques d ecole demandees sont introuvables.');
    }

    return statistiques;
  }
}
