import type { ConsulterComparatifClassesInput } from '../../dto/input/ConsulterComparatifClassesInput';
import { QueryException } from '../../exceptions/QueryException';
import type { AutorisationConsultationStatistiquesPort } from '../../ports/out/AutorisationConsultationStatistiquesPort';
import type { ComparatifClassesQuery } from '../../queries/ComparatifClassesQuery';
import type { ComparatifClasseReadModel } from '../../read-models/ComparatifClasseReadModel';

// Ce use case encapsule la lecture autorisee d'un comparatif de classes.
export class ConsulterComparatifClassesUseCase {
  constructor(
    private readonly query: ComparatifClassesQuery,
    private readonly autorisationConsultationStatistiquesPort?: AutorisationConsultationStatistiquesPort,
  ) {}

  public async executer(input: ConsulterComparatifClassesInput): Promise<ComparatifClasseReadModel[]> {
    for (const idClassePedagogique of input.idClassesPedagogiques) {
      await this.autorisationConsultationStatistiquesPort?.verifierConsultationStatistiquesClasse({
        idUtilisateur: input.idUtilisateur,
        idOrganisation: input.idOrganisation,
        idEcole: input.idEcole,
        idClassePedagogique,
        idAnneeScolaire: input.idAnneeScolaire,
      });
    }

    const sortie = await this.query.executer(
      input.idClassesPedagogiques,
      input.idAnneeScolaire,
      input.codeColonne,
    );

    if (sortie.length === 0) {
      throw new QueryException('Aucune classe comparable n a ete trouvee.');
    }

    return sortie;
  }
}
