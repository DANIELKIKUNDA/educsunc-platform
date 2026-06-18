import { QueryException } from '../../exceptions/QueryException';
import type { ConsulterDeliberationClasseInput } from '../../dto/input/ConsulterDeliberationClasseInput';
import type { AutorisationConsultationStatistiquesPort } from '../../ports/out/AutorisationConsultationStatistiquesPort';
import type { SectionClassePedagogiquePort } from '../../ports/out/SectionClassePedagogiquePort';
import type { DossierDeliberationQuery } from '../../queries/DossierDeliberationQuery';
import type { DossierDeliberationReadModel } from '../../read-models/DossierDeliberationReadModel';

// Ce use case encapsule la lecture autorisee des dossiers de deliberation d'une classe.
export class ConsulterDeliberationClasseUseCase {
  constructor(
    private readonly query: DossierDeliberationQuery,
    private readonly sectionClassePedagogiquePort: SectionClassePedagogiquePort,
    private readonly autorisationConsultationStatistiquesPort?: AutorisationConsultationStatistiquesPort,
  ) {}

  public async executer(input: ConsulterDeliberationClasseInput): Promise<DossierDeliberationReadModel[]> {
    await this.autorisationConsultationStatistiquesPort?.verifierConsultationStatistiquesClasse({
      idUtilisateur: input.idUtilisateur,
      idOrganisation: input.idOrganisation,
      idEcole: input.idEcole,
      idClassePedagogique: input.idClassePedagogique,
      idAnneeScolaire: input.idAnneeScolaire,
    });

    const section = await this.sectionClassePedagogiquePort.consulterSectionClasse({
      idOrganisation: input.idOrganisation,
      idEcole: input.idEcole,
      idClassePedagogique: input.idClassePedagogique,
      idAnneeScolaire: input.idAnneeScolaire,
    });

    if (section === null) {
      throw new QueryException('La section scolaire de la classe demandee est introuvable.');
    }

    if (section.sectionCode.toUpperCase() !== 'SECONDAIRE') {
      throw new QueryException('La deliberation n est disponible que pour les classes du secondaire.');
    }

    return this.query.executer(
      input.idClassePedagogique,
      input.idAnneeScolaire,
      input.codeColonne,
    );
  }
}
