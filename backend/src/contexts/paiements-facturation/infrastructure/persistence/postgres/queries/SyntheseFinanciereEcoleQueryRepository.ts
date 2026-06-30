import type { SqlQueryClient } from '../../../../../../shared/infrastructure/persistence/SqlQueryClient';
import { Money } from '../../../../domain/value-objects/Money';
import type { SyntheseFinanciereSectionRepository } from '../../../../application/use-cases/rapports/ConsulterSyntheseFinanciereSectionUseCase';
import type { SyntheseFinanciereEcoleRepository } from '../../../../application/use-cases/rapports/ConsulterSyntheseFinanciereEcoleUseCase';
import type { SyntheseFinanciereEcoleReadModel } from '../../../../application/read-models/SyntheseFinanciereEcoleReadModel';

interface LigneSectionEcole {
  id: string;
  code: string | null;
  libelle: string;
}

export class SyntheseFinanciereEcoleQueryRepository
  implements SyntheseFinanciereEcoleRepository
{
  constructor(
    private readonly clientReferentiel: SqlQueryClient,
    private readonly syntheseSectionRepository: SyntheseFinanciereSectionRepository,
  ) {}

  public async consulterSyntheseEcole(params: {
    idOrganisation: string;
    idEcole: string;
    idAnneeScolaire: string;
    moisAnalyseJusqua?: string;
    typeFrais?: string;
  }): Promise<SyntheseFinanciereEcoleReadModel> {
    const sections = await this.listerSectionsEcole(params.idEcole);
    const syntheses = await Promise.all(
      sections.map(async (section) => ({
        section,
        synthese: await this.syntheseSectionRepository.consulterSyntheseSection({
          idOrganisation: params.idOrganisation,
          idEcole: params.idEcole,
          idAnneeScolaire: params.idAnneeScolaire,
          idSectionScolaire: section.id,
          moisAnalyseJusqua: params.moisAnalyseJusqua,
          typeFrais: params.typeFrais,
        }),
      })),
    );

    const lignes = syntheses.map(({ section, synthese }) => ({
      idSectionScolaire: section.id,
      section: section.libelle,
      effectifTotal: synthese.totalGeneralSection.effectifTotal,
      elevesRedevables: synthese.totalGeneralSection.elevesRedevables,
      elevesEnOrdre: synthese.totalGeneralSection.elevesEnOrdre,
      elevesNonEnOrdre: synthese.totalGeneralSection.elevesNonEnOrdre,
      montantAttendu: new Money(synthese.totalGeneralSection.montantAttendu.obtenirMontant(), 'CDF'),
      montantPaye: new Money(synthese.totalGeneralSection.montantPaye.obtenirMontant(), 'CDF'),
      resteARecouvrer: new Money(synthese.totalGeneralSection.resteARecouvrer.obtenirMontant(), 'CDF'),
      tauxRecouvrement: synthese.totalGeneralSection.tauxRecouvrement,
    }));

    const totalAttendu = lignes.reduce((total, ligne) => total + ligne.montantAttendu.obtenirMontant(), 0);
    const totalPaye = lignes.reduce((total, ligne) => total + ligne.montantPaye.obtenirMontant(), 0);
    const totalReste = lignes.reduce((total, ligne) => total + ligne.resteARecouvrer.obtenirMontant(), 0);

    return {
      idOrganisation: params.idOrganisation,
      idEcole: params.idEcole,
      idAnneeScolaire: params.idAnneeScolaire,
      moisAnalyseJusqua: params.moisAnalyseJusqua,
      typeFrais: params.typeFrais,
      lignes,
      totalGeneralEcole: {
        effectifTotal: lignes.reduce((total, ligne) => total + ligne.effectifTotal, 0),
        elevesRedevables: lignes.reduce((total, ligne) => total + ligne.elevesRedevables, 0),
        elevesEnOrdre: lignes.reduce((total, ligne) => total + ligne.elevesEnOrdre, 0),
        elevesNonEnOrdre: lignes.reduce((total, ligne) => total + ligne.elevesNonEnOrdre, 0),
        montantAttendu: new Money(totalAttendu, 'CDF'),
        montantPaye: new Money(totalPaye, 'CDF'),
        resteARecouvrer: new Money(totalReste, 'CDF'),
        tauxRecouvrement: totalAttendu === 0 ? 0 : Number(((totalPaye / totalAttendu) * 100).toFixed(2)),
      },
    };
  }

  private async listerSectionsEcole(idEcole: string): Promise<readonly LigneSectionEcole[]> {
    const resultat = await this.clientReferentiel.executer<LigneSectionEcole>(
      [
        'SELECT DISTINCT',
        '"ss"."id",',
        '"ss"."code",',
        '"ss"."libelle"',
        'FROM "classes_pedagogiques" "cp"',
        'JOIN "classes_academiques" "ca" ON "ca"."id" = "cp"."id_classe_academique"',
        'JOIN "sections_scolaires" "ss" ON "ss"."id" = "ca"."id_section_scolaire"',
        'WHERE "cp"."id_ecole" = $1',
        'AND "cp"."archive_le" IS NULL',
        'ORDER BY "ss"."libelle" ASC',
      ].join(' '),
      [idEcole],
    );

    return resultat.lignes;
  }
}
