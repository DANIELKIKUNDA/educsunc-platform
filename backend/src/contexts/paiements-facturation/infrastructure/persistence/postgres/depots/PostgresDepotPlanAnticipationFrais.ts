import { PlanAnticipationFrais } from '../../../../domain/aggregates/PlanAnticipationFrais';
import type { DepotPlanAnticipationFrais } from '../../../../domain/repositories/DepotPlanAnticipationFrais';
import { BaseDepotPostgresPaiementsFacturation } from './BaseDepotPostgresPaiementsFacturation';
import type { ClientPostgresPaiementsFacturation } from './ClientPostgresPaiementsFacturation';
import type { PostgresUnitOfWork } from '../transaction/PostgresUnitOfWork';
import type { PaiementTenantContext } from '../../../tenancy/PaiementTenantContext';
import { MappersPaiementsPostgres, type PersistancePlanAnticipationFraisPostgres } from '../mappers/MappersPaiementsPostgres';

// Ce depot persiste les plans danticipation et de lissage des frais.
export class PostgresDepotPlanAnticipationFrais
  extends BaseDepotPostgresPaiementsFacturation
  implements DepotPlanAnticipationFrais
{
  constructor(
    clientLecture: ClientPostgresPaiementsFacturation,
    uniteDeTravail?: PostgresUnitOfWork<ClientPostgresPaiementsFacturation>,
    contexteTenant?: PaiementTenantContext,
  ) {
    super(clientLecture, uniteDeTravail, contexteTenant);
  }

  public async sauvegarder(plan: PlanAnticipationFrais): Promise<void> {
    this.verifierEcritureLocaleAutorisee(plan.obtenirIdEcole());
    const ligne = MappersPaiementsPostgres.versPersistancePlan(plan);
    const colonnes = [
      'id',
      'id_ecole',
      'id_annee_scolaire',
      'nom',
      'type_plan',
      'mois_cibles',
      'mois_supports',
      'obligatoire',
      'actif',
      'date_debut',
      'date_fin',
      'version',
    ] as const;
    await this.sauvegarderAgregatVersionne(
      plan,
      'plans_anticipation_frais',
      'id',
      plan.obtenirId(),
      colonnes,
      this.extraireValeursTypage(ligne, colonnes),
    );
  }

  public async trouverParId(
    idPlanAnticipation: string,
  ): Promise<PlanAnticipationFrais | null> {
    const ligne =
      await this.executerRequeteUnique<PersistancePlanAnticipationFraisPostgres>(
        'SELECT * FROM "plans_anticipation_frais" WHERE "id" = $1 LIMIT 1',
        [idPlanAnticipation],
      );

    return ligne === null
      ? null
      : this.marquerAgregatCharge(
        MappersPaiementsPostgres.depuisPersistancePlan(ligne),
      );
  }

  public async listerActifsParEcoleEtAnnee(
    idEcole: string,
    idAnneeScolaire: string,
  ): Promise<PlanAnticipationFrais[]> {
    const lignes =
      await this.executerRequete<PersistancePlanAnticipationFraisPostgres>(
        [
          'SELECT * FROM "plans_anticipation_frais"',
          'WHERE "id_ecole" = $1 AND "id_annee_scolaire" = $2 AND "actif" = true',
          'ORDER BY "nom" ASC',
        ].join(' '),
        [idEcole, idAnneeScolaire],
      );

    return lignes.map((ligne) =>
      this.marquerAgregatCharge(
        MappersPaiementsPostgres.depuisPersistancePlan(ligne),
      ));
  }

  private extraireValeursTypage<T extends object, K extends keyof T>(
    objet: T,
    cles: readonly K[],
  ): readonly unknown[] {
    return cles.map((cle) => objet[cle]);
  }
}
