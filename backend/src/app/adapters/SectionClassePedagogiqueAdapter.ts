import type { SectionClassePedagogiquePort } from '../../contexts/bulletins-evaluations/application/ports/out/SectionClassePedagogiquePort';
import { ResponsabiliteClassePedagogiqueAdapter } from './ResponsabiliteClassePedagogiqueAdapter';

// Cet adaptateur relit la section effective d'une classe via le referentiel academique.
export class SectionClassePedagogiqueAdapter implements SectionClassePedagogiquePort {
  private readonly responsabiliteClassePedagogiqueAdapter = new ResponsabiliteClassePedagogiqueAdapter();

  public async consulterSectionClasse(params: {
    idOrganisation?: string;
    idEcole: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
  }): Promise<{
    idSectionScolaire: string;
    sectionCode: string;
    sectionLibelle: string;
  } | null> {
    const responsabilite = await this.responsabiliteClassePedagogiqueAdapter.consulterActiveParClasseEtAnnee({
      idOrganisation: params.idOrganisation,
      idEcole: params.idEcole,
      idClassePedagogique: params.idClassePedagogique,
      idAnneeScolaire: params.idAnneeScolaire,
    });

    if (responsabilite === null) {
      return null;
    }

    return {
      idSectionScolaire: responsabilite.idSectionScolaire,
      sectionCode: responsabilite.sectionCode,
      sectionLibelle: responsabilite.sectionLibelle,
    };
  }

  public async fermer(): Promise<void> {
    await this.responsabiliteClassePedagogiqueAdapter.fermer();
  }
}
