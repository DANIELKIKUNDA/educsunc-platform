import type { ConsulterEchecsClasseInput } from '../../dto/input/ConsulterEchecsClasseInput';
import type { AutorisationConsultationStatistiquesPort } from '../../ports/out/AutorisationConsultationStatistiquesPort';
import type { EchecsClasseQuery } from '../../queries/EchecsClasseQuery';
import type { EleveEchecReadModel } from '../../read-models/EleveEchecReadModel';

// Ce use case encapsule la lecture autorisee des eleves en echec profond d'une classe.
export class ConsulterEchecsProfondsClasseUseCase {
  constructor(
    private readonly query: EchecsClasseQuery,
    private readonly autorisationConsultationStatistiquesPort?: AutorisationConsultationStatistiquesPort,
  ) {}

  public async executer(input: ConsulterEchecsClasseInput): Promise<EleveEchecReadModel[]> {
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
      { profondsSeulement: true },
    );
  }
}
