import type { ConsulterEvolutionResultatInput } from '../../dto/input/ConsulterEvolutionResultatInput';
import { QueryException } from '../../exceptions/QueryException';
import type { AutorisationConsultationStatistiquesPort } from '../../ports/out/AutorisationConsultationStatistiquesPort';
import type { EvolutionResultatQuery } from '../../queries/EvolutionResultatQuery';
import type { ResultatsEleveQuery } from '../../queries/ResultatsEleveQuery';
import type { EvolutionResultatReadModel } from '../../read-models/EvolutionResultatReadModel';

// Ce use case encapsule la lecture autorisee de l'evolution d'un resultat consolide.
export class ConsulterEvolutionResultatUseCase {
  constructor(
    private readonly query: EvolutionResultatQuery,
    private readonly resultatsEleveQuery: ResultatsEleveQuery,
    private readonly autorisationConsultationStatistiquesPort?: AutorisationConsultationStatistiquesPort,
  ) {}

  public async executer(input: ConsulterEvolutionResultatInput): Promise<EvolutionResultatReadModel[]> {
    const resultatCourant = await this.resultatsEleveQuery.executer(input.idEleve, input.idAnneeScolaire);
    if (resultatCourant === null) {
      throw new QueryException('Le resultat demande est introuvable.');
    }

    await this.autorisationConsultationStatistiquesPort?.verifierConsultationStatistiquesClasse({
      idUtilisateur: input.idUtilisateur,
      idOrganisation: input.idOrganisation,
      idEcole: resultatCourant.idEcole,
      idClassePedagogique: resultatCourant.idClassePedagogique,
      idAnneeScolaire: input.idAnneeScolaire,
    });

    return this.query.executer(input.idEleve, input.idAnneeScolaire, input.codeColonne);
  }
}
