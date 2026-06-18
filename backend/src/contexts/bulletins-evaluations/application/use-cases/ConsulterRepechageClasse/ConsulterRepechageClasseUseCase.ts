import { QueryException } from '../../exceptions/QueryException';
import type { ConsulterRepechageClasseInput } from '../../dto/input/ConsulterRepechageClasseInput';
import type { AutorisationConsultationStatistiquesPort } from '../../ports/out/AutorisationConsultationStatistiquesPort';
import type { SectionClassePedagogiquePort } from '../../ports/out/SectionClassePedagogiquePort';
import type { EligibiliteRepechageQuery } from '../../queries/EligibiliteRepechageQuery';
import type { EligibiliteRepechageReadModel } from '../../read-models/EligibiliteRepechageReadModel';

// Ce use case encapsule la lecture autorisee des eligibilites au repechage.
export class ConsulterRepechageClasseUseCase {
  constructor(
    private readonly query: EligibiliteRepechageQuery,
    private readonly sectionClassePedagogiquePort: SectionClassePedagogiquePort,
    private readonly autorisationConsultationStatistiquesPort?: AutorisationConsultationStatistiquesPort,
  ) {}

  public async executer(input: ConsulterRepechageClasseInput): Promise<EligibiliteRepechageReadModel[]> {
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
      throw new QueryException('Le repechage n est disponible que pour les classes du secondaire.');
    }

    return this.query.executer(
      input.idClassePedagogique,
      input.idAnneeScolaire,
      input.codeColonne,
    );
  }
}
