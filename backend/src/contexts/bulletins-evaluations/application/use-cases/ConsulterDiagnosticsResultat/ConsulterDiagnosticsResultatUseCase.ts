import type { ConsulterDiagnosticsResultatInput } from '../../dto/input/ConsulterDiagnosticsResultatInput';
import { QueryException } from '../../exceptions/QueryException';
import type { AutorisationConsultationStatistiquesPort } from '../../ports/out/AutorisationConsultationStatistiquesPort';
import type { DiagnosticEchecQuery } from '../../queries/DiagnosticEchecQuery';
import type { ResultatsEleveQuery } from '../../queries/ResultatsEleveQuery';
import type { DiagnosticEchecReadModel } from '../../read-models/DiagnosticEchecReadModel';

// Ce use case encapsule la lecture autorisee des diagnostics d'un resultat eleve.
export class ConsulterDiagnosticsResultatUseCase {
  constructor(
    private readonly diagnosticEchecQuery: DiagnosticEchecQuery,
    private readonly resultatsEleveQuery: ResultatsEleveQuery,
    private readonly autorisationConsultationStatistiquesPort?: AutorisationConsultationStatistiquesPort,
  ) {}

  public async executer(input: ConsulterDiagnosticsResultatInput): Promise<DiagnosticEchecReadModel[]> {
    const resultat = await this.resultatsEleveQuery.executer(input.idEleve, input.idAnneeScolaire);
    if (resultat === null) {
      throw new QueryException('Le resultat demande est introuvable.');
    }

    await this.autorisationConsultationStatistiquesPort?.verifierConsultationStatistiquesClasse({
      idUtilisateur: input.idUtilisateur,
      idOrganisation: input.idOrganisation,
      idEcole: resultat.idEcole,
      idClassePedagogique: resultat.idClassePedagogique,
      idAnneeScolaire: input.idAnneeScolaire,
    });

    return this.diagnosticEchecQuery.executer(input.idEleve, input.idAnneeScolaire);
  }
}
