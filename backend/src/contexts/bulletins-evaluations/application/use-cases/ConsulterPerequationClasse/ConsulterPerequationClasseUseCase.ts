import { QueryException } from '../../exceptions/QueryException';
import type { ConsulterPerequationClasseInput } from '../../dto/input/ConsulterPerequationClasseInput';
import type { AutorisationConsultationStatistiquesPort } from '../../ports/out/AutorisationConsultationStatistiquesPort';
import type { SectionClassePedagogiquePort } from '../../ports/out/SectionClassePedagogiquePort';
import type { EligibilitePerequationQuery } from '../../queries/EligibilitePerequationQuery';
import type { EligibilitePerequationReadModel } from '../../read-models/EligibilitePerequationReadModel';

// Ce use case encapsule la lecture autorisee des eligibilites a la perequation.
export class ConsulterPerequationClasseUseCase {
  constructor(
    private readonly query: EligibilitePerequationQuery,
    private readonly sectionClassePedagogiquePort: SectionClassePedagogiquePort,
    private readonly autorisationConsultationStatistiquesPort?: AutorisationConsultationStatistiquesPort,
  ) {}

  public async executer(input: ConsulterPerequationClasseInput): Promise<EligibilitePerequationReadModel[]> {
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
      throw new QueryException('La perequation n est disponible que pour les classes du secondaire.');
    }

    return this.query.executer(
      input.idClassePedagogique,
      input.idAnneeScolaire,
      input.codeColonne,
    );
  }
}
