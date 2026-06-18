import { QueryException } from '../../exceptions/QueryException';
import type { ConsulterSecondeSessionClasseInput } from '../../dto/input/ConsulterSecondeSessionClasseInput';
import type { AutorisationConsultationStatistiquesPort } from '../../ports/out/AutorisationConsultationStatistiquesPort';
import type { SectionClassePedagogiquePort } from '../../ports/out/SectionClassePedagogiquePort';
import type { DossierSecondeSessionQuery } from '../../queries/DossierSecondeSessionQuery';
import type { DossierSecondeSessionReadModel } from '../../read-models/DossierSecondeSessionReadModel';

// Ce use case encapsule la lecture autorisee des dossiers de seconde session d'une classe.
export class ConsulterSecondeSessionClasseUseCase {
  constructor(
    private readonly query: DossierSecondeSessionQuery,
    private readonly sectionClassePedagogiquePort: SectionClassePedagogiquePort,
    private readonly autorisationConsultationStatistiquesPort?: AutorisationConsultationStatistiquesPort,
  ) {}

  public async executer(input: ConsulterSecondeSessionClasseInput): Promise<DossierSecondeSessionReadModel[]> {
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
      throw new QueryException('La seconde session n est disponible que pour les classes du secondaire.');
    }

    return this.query.executer(
      input.idClassePedagogique,
      input.idAnneeScolaire,
      input.codeColonne,
    );
  }
}
