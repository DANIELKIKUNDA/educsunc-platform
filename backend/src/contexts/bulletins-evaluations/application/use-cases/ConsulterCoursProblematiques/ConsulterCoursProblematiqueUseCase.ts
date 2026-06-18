import type { ConsulterCoursProblematiqueInput } from '../../dto/input/ConsulterCoursProblematiquesInput';
import { QueryException } from '../../exceptions/QueryException';
import type { AutorisationConsultationStatistiquesPort } from '../../ports/out/AutorisationConsultationStatistiquesPort';
import type { CriteresAnalysePedagogiquePort } from '../../ports/out/CriteresAnalysePedagogiquePort';
import type { CoursProblematiqueQuery } from '../../queries/CoursProblematiqueQuery';
import type { CoursProblematiqueReadModel } from '../../read-models/CoursProblematiqueReadModel';

// Ce use case encapsule la lecture autorisee des cours problematiques d'une classe.
export class ConsulterCoursProblematiqueUseCase {
  constructor(
    private readonly query: CoursProblematiqueQuery,
    private readonly criteresAnalysePedagogiquePort?: CriteresAnalysePedagogiquePort,
    private readonly autorisationConsultationStatistiquesPort?: AutorisationConsultationStatistiquesPort,
  ) {}

  public async executer(input: ConsulterCoursProblematiqueInput): Promise<CoursProblematiqueReadModel[]> {
    await this.autorisationConsultationStatistiquesPort?.verifierConsultationStatistiquesClasse({
      idUtilisateur: input.idUtilisateur,
      idOrganisation: input.idOrganisation,
      idEcole: input.idEcole,
      idClassePedagogique: input.idClassePedagogique,
      idAnneeScolaire: input.idAnneeScolaire,
    });

    const criteres = await this.criteresAnalysePedagogiquePort?.resoudreCriteresAnalysePedagogique({
      idEcole: input.idEcole,
      idClassePedagogique: input.idClassePedagogique,
      idAnneeScolaire: input.idAnneeScolaire,
      idProgrammeNiveau: input.idClassePedagogique,
    });

    const sortie = await this.query.executer(
      input.idClassePedagogique,
      input.idAnneeScolaire,
      input.codeColonne,
      criteres?.obtenirSeuilEchec() ?? 50,
      criteres?.obtenirSeuilEchecProfond() ?? 25,
    );

    if (sortie.length === 0) {
      throw new QueryException('Aucun cours problematique n a ete detecte pour les filtres demandes.');
    }

    return sortie;
  }
}
