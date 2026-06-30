import { Money } from '../../../../domain/value-objects/Money';
import type { SqlQueryClient } from '../../../../../../shared/infrastructure/persistence/SqlQueryClient';
import type { SyntheseFinanciereClasseRepository } from '../../../../application/use-cases/rapports/ConsulterSyntheseFinanciereClasseUseCase';
import type { SyntheseFinanciereSectionRepository } from '../../../../application/use-cases/rapports/ConsulterSyntheseFinanciereSectionUseCase';
import type { SyntheseFinanciereSectionReadModel } from '../../../../application/read-models/SyntheseFinanciereSectionReadModel';

interface LigneClasseSection {
  id: string;
  libelle: string;
}

export class SyntheseFinanciereSectionQueryRepository
  implements SyntheseFinanciereSectionRepository
{
  constructor(
    private readonly clientReferentiel: SqlQueryClient,
    private readonly syntheseClasseRepository: SyntheseFinanciereClasseRepository,
  ) {}

  public async consulterSyntheseSection(params: {
    idOrganisation: string;
    idEcole: string;
    idAnneeScolaire: string;
    idSectionScolaire: string;
    moisAnalyseJusqua?: string;
    typeFrais?: string;
  }): Promise<SyntheseFinanciereSectionReadModel> {
    const classes = await this.listerClassesSection(params.idEcole, params.idSectionScolaire);
    const syntheses = await Promise.all(
      classes.map(async (classe) => ({
        classe,
        synthese: await this.syntheseClasseRepository.consulterSyntheseClasse({
          idOrganisation: params.idOrganisation,
          idEcole: params.idEcole,
          idAnneeScolaire: params.idAnneeScolaire,
          idClassePedagogique: classe.id,
          moisAnalyseJusqua: params.moisAnalyseJusqua,
          typeFrais: params.typeFrais,
        }),
      })),
    );

    const lignes = syntheses.map(({ classe, synthese }) => ({
      idClassePedagogique: classe.id,
      classe: classe.libelle,
      effectifTotal: synthese.situationActuelle.effectifTotal,
      elevesRedevables: synthese.situationActuelle.elevesRedevables,
      elevesEnOrdre: synthese.situationActuelle.elevesEnOrdre,
      elevesNonEnOrdre: synthese.situationActuelle.elevesNonEnOrdre,
      montantAttendu: new Money(synthese.situationActuelle.montantAttendu.obtenirMontant(), 'CDF'),
      montantPaye: new Money(synthese.situationActuelle.montantPaye.obtenirMontant(), 'CDF'),
      resteARecouvrer: new Money(synthese.situationActuelle.resteARecouvrer.obtenirMontant(), 'CDF'),
      tauxRecouvrement: synthese.situationActuelle.tauxRecouvrement,
    }));

    const totalAttendu = lignes.reduce((total, ligne) => total + ligne.montantAttendu.obtenirMontant(), 0);
    const totalPaye = lignes.reduce((total, ligne) => total + ligne.montantPaye.obtenirMontant(), 0);
    const totalReste = lignes.reduce((total, ligne) => total + ligne.resteARecouvrer.obtenirMontant(), 0);

    return {
      idOrganisation: params.idOrganisation,
      idEcole: params.idEcole,
      idAnneeScolaire: params.idAnneeScolaire,
      idSectionScolaire: params.idSectionScolaire,
      moisAnalyseJusqua: params.moisAnalyseJusqua,
      typeFrais: params.typeFrais,
      lignes,
      totalGeneralSection: {
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

  private async listerClassesSection(
    idEcole: string,
    idSectionScolaire: string,
  ): Promise<readonly LigneClasseSection[]> {
    const resultat = await this.clientReferentiel.executer<LigneClasseSection>(
      [
        'SELECT',
        '"cp"."id",',
        '"cp"."libelle"',
        'FROM "classes_pedagogiques" "cp"',
        'JOIN "classes_academiques" "ca" ON "ca"."id" = "cp"."id_classe_academique"',
        'WHERE "cp"."id_ecole" = $1',
        'AND "ca"."id_section_scolaire" = $2',
        'AND "cp"."archive_le" IS NULL',
        'ORDER BY "cp"."libelle" ASC',
      ].join(' '),
      [idEcole, idSectionScolaire],
    );

    return resultat.lignes;
  }
}
