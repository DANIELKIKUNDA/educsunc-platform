import { ObligationFinanciereEleve } from '../../../../domain/aggregates/ObligationFinanciereEleve';
import type { DepotObligationFinanciere } from '../../../../domain/repositories/DepotObligationFinanciere';
import { BaseDepotPostgresPaiementsFacturation } from './BaseDepotPostgresPaiementsFacturation';
import type { ClientPostgresPaiementsFacturation } from './ClientPostgresPaiementsFacturation';
import type { PostgresUnitOfWork } from '../transaction/PostgresUnitOfWork';
import type { PaiementTenantContext } from '../../../tenancy/PaiementTenantContext';
import { MappersPaiementsPostgres, type PersistanceObligationFinancierePostgres } from '../mappers/MappersPaiementsPostgres';

// Ce depot persiste les obligations financieres unitaires des eleves.
export class PostgresDepotObligationFinanciere
  extends BaseDepotPostgresPaiementsFacturation
  implements DepotObligationFinanciere
{
  constructor(
    clientLecture: ClientPostgresPaiementsFacturation,
    uniteDeTravail?: PostgresUnitOfWork<ClientPostgresPaiementsFacturation>,
    contexteTenant?: PaiementTenantContext,
  ) {
    super(clientLecture, uniteDeTravail, contexteTenant);
  }

  public async sauvegarder(
    obligation: ObligationFinanciereEleve,
  ): Promise<void> {
    this.verifierEcritureLocaleAutorisee(obligation.obtenirIdEcole());
    const ligne = MappersPaiementsPostgres.versPersistanceObligation(obligation);
    const colonnes = [
      'id',
      'id_ecole',
      'id_eleve',
      'id_annee_scolaire',
      'id_inscription_scolaire',
      'type_frais',
      'reference_frais',
      'libelle',
      'montant_initial',
      'devise',
      'montant_paye',
      'montant_exonere',
      'solde',
      'statut',
      'origine_creation',
      'origine_paiement',
      'id_grille_tarification',
      'cree_le',
      'cree_par',
      'version',
    ] as const;

    await this.sauvegarderAgregatVersionne(
      obligation,
      'obligations_financieres',
      'id',
      obligation.obtenirId(),
      colonnes,
      this.extraireValeursTypage(ligne, colonnes),
    );
  }

  public async trouverParId(
    idObligation: string,
  ): Promise<ObligationFinanciereEleve | null> {
    const ligne =
      await this.executerRequeteUnique<PersistanceObligationFinancierePostgres>(
        'SELECT * FROM "obligations_financieres" WHERE "id" = $1 LIMIT 1',
        [idObligation],
      );

    return ligne === null
      ? null
      : this.marquerAgregatCharge(
        MappersPaiementsPostgres.depuisPersistanceObligation(ligne),
      );
  }

  public async listerParEleveEtAnnee(
    idEcole: string,
    idEleve: string,
    idAnneeScolaire: string,
  ): Promise<ObligationFinanciereEleve[]> {
    const filtreAnnee =
      idAnneeScolaire.trim().length === 0
        ? ''
        : 'AND "id_annee_scolaire" = $3';
    const parametres =
      idAnneeScolaire.trim().length === 0
        ? [idEcole, idEleve]
        : [idEcole, idEleve, idAnneeScolaire];
    const lignes = await this.executerRequete<PersistanceObligationFinancierePostgres>(
      [
        'SELECT * FROM "obligations_financieres"',
        'WHERE "id_ecole" = $1',
        'AND "id_eleve" = $2',
        filtreAnnee,
        'ORDER BY "cree_le" ASC',
      ].join(' '),
      parametres,
    );

    return lignes.map((ligne) =>
      this.marquerAgregatCharge(
        MappersPaiementsPostgres.depuisPersistanceObligation(ligne),
      ));
  }

  private extraireValeursTypage<T extends object, K extends keyof T>(
    objet: T,
    cles: readonly K[],
  ): readonly unknown[] {
    return cles.map((cle) => objet[cle]);
  }
}
