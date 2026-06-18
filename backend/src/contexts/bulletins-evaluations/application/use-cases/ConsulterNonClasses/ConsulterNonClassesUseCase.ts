import type { ConsulterNonClassesInput } from '../../dto/input/ConsulterNonClassesInput';
import type { AutorisationConsultationStatistiquesPort } from '../../ports/out/AutorisationConsultationStatistiquesPort';
import type { NonClassesQuery } from '../../queries/NonClassesQuery';
import type { NonClasseReadModel } from '../../read-models/NonClasseReadModel';

// Ce use case encapsule la lecture autorisee des non classes d'une classe.
export class ConsulterNonClassesUseCase {
  constructor(
    private readonly query: NonClassesQuery,
    private readonly autorisationConsultationStatistiquesPort?: AutorisationConsultationStatistiquesPort,
  ) {}

  public async executer(input: ConsulterNonClassesInput): Promise<NonClasseReadModel[]> {
    await this.autorisationConsultationStatistiquesPort?.verifierConsultationStatistiquesClasse({
      idUtilisateur: input.idUtilisateur,
      idOrganisation: input.idOrganisation,
      idEcole: input.idEcole,
      idClassePedagogique: input.idClassePedagogique,
      idAnneeScolaire: input.idAnneeScolaire,
    });

    return this.query.executer(
      input.idClassePedagogique,
      input.idAnneeScolaire,
      input.codeColonne,
    );
  }
}
