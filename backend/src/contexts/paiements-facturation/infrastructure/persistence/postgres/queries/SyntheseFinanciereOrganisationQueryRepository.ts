import type { SqlQueryClient } from '../../../../../../shared/infrastructure/persistence/SqlQueryClient';
import { Money } from '../../../../domain/value-objects/Money';
import type { SyntheseFinanciereEcoleRepository } from '../../../../application/use-cases/rapports/ConsulterSyntheseFinanciereEcoleUseCase';
import type { SyntheseFinanciereOrganisationRepository } from '../../../../application/use-cases/rapports/ConsulterSyntheseFinanciereOrganisationUseCase';
import type { SyntheseFinanciereOrganisationReadModel } from '../../../../application/read-models/SyntheseFinanciereOrganisationReadModel';

interface LigneEcoleOrganisation {
  id: string;
  nom: string;
}

export class SyntheseFinanciereOrganisationQueryRepository
  implements SyntheseFinanciereOrganisationRepository
{
  constructor(
    private readonly clientReferentiel: SqlQueryClient,
    private readonly syntheseEcoleRepository: SyntheseFinanciereEcoleRepository,
  ) {}

  public async consulterSyntheseOrganisation(params: {
    idOrganisation: string;
    idAnneeScolaire: string;
    moisAnalyseJusqua?: string;
    typeFrais?: string;
  }): Promise<SyntheseFinanciereOrganisationReadModel> {
    const ecoles = await this.listerEcolesOrganisation(params.idOrganisation);
    const syntheses = await Promise.all(
      ecoles.map(async (ecole) => ({
        ecole,
        synthese: await this.syntheseEcoleRepository.consulterSyntheseEcole({
          idOrganisation: params.idOrganisation,
          idEcole: ecole.id,
          idAnneeScolaire: params.idAnneeScolaire,
          moisAnalyseJusqua: params.moisAnalyseJusqua,
          typeFrais: params.typeFrais,
        }),
      })),
    );

    const lignes = syntheses.map(({ ecole, synthese }) => ({
      idEcole: ecole.id,
      ecole: ecole.nom,
      effectifTotal: synthese.totalGeneralEcole.effectifTotal,
      elevesRedevables: synthese.totalGeneralEcole.elevesRedevables,
      elevesEnOrdre: synthese.totalGeneralEcole.elevesEnOrdre,
      elevesNonEnOrdre: synthese.totalGeneralEcole.elevesNonEnOrdre,
      montantAttendu: new Money(synthese.totalGeneralEcole.montantAttendu.obtenirMontant(), 'CDF'),
      montantPaye: new Money(synthese.totalGeneralEcole.montantPaye.obtenirMontant(), 'CDF'),
      resteARecouvrer: new Money(synthese.totalGeneralEcole.resteARecouvrer.obtenirMontant(), 'CDF'),
      tauxRecouvrement: synthese.totalGeneralEcole.tauxRecouvrement,
    }));

    const totalAttendu = lignes.reduce((total, ligne) => total + ligne.montantAttendu.obtenirMontant(), 0);
    const totalPaye = lignes.reduce((total, ligne) => total + ligne.montantPaye.obtenirMontant(), 0);
    const totalReste = lignes.reduce((total, ligne) => total + ligne.resteARecouvrer.obtenirMontant(), 0);

    return {
      idOrganisation: params.idOrganisation,
      idAnneeScolaire: params.idAnneeScolaire,
      moisAnalyseJusqua: params.moisAnalyseJusqua,
      typeFrais: params.typeFrais,
      lignes,
      totalGeneralOrganisation: {
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

  private async listerEcolesOrganisation(idOrganisation: string): Promise<readonly LigneEcoleOrganisation[]> {
    const resultat = await this.clientReferentiel.executer<LigneEcoleOrganisation>(
      [
        'SELECT DISTINCT',
        '"e"."id",',
        '"e"."nom"',
        'FROM "classes_pedagogiques" "cp"',
        'JOIN "ecoles" "e" ON "e"."id" = "cp"."id_ecole"',
        'WHERE "cp"."id_organisation" = $1',
        'AND "cp"."archive_le" IS NULL',
        'ORDER BY "e"."nom" ASC',
      ].join(' '),
      [idOrganisation],
    );

    return resultat.lignes;
  }
}
