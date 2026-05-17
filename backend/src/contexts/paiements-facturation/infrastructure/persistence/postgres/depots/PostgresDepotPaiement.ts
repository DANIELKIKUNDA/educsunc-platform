import { Paiement } from '../../../../domain/aggregates/Paiement';
import type { DepotPaiement } from '../../../../domain/repositories/DepotPaiement';
import type { RepartitionPaiement } from '../../../../domain/entities/RepartitionPaiement';
import { BaseDepotPostgresPaiementsFacturation } from './BaseDepotPostgresPaiementsFacturation';
import type { ClientPostgresPaiementsFacturation } from './ClientPostgresPaiementsFacturation';
import type { PostgresUnitOfWork } from '../transaction/PostgresUnitOfWork';
import type { PaiementTenantContext } from '../../../tenancy/PaiementTenantContext';
import {
  MappersPaiementsPostgres,
  type PersistancePaiementPostgres,
  type PersistanceRepartitionPaiementPostgres,
} from '../mappers/MappersPaiementsPostgres';

// Ce depot persiste les paiements et leurs repartitions detaillees.
export class PostgresDepotPaiement
  extends BaseDepotPostgresPaiementsFacturation
  implements DepotPaiement
{
  constructor(
    clientLecture: ClientPostgresPaiementsFacturation,
    uniteDeTravail?: PostgresUnitOfWork<ClientPostgresPaiementsFacturation>,
    contexteTenant?: PaiementTenantContext,
  ) {
    super(clientLecture, uniteDeTravail, contexteTenant);
  }

  public async sauvegarder(paiement: Paiement): Promise<void> {
    this.verifierEcritureLocaleAutorisee(paiement.obtenirIdEcole());
    const ligne = MappersPaiementsPostgres.versPersistancePaiement(paiement);
    const colonnes = [
      'id',
      'id_ecole',
      'id_eleve',
      'montant_total',
      'devise',
      'mode_paiement',
      'type_frais_declare',
      'cible_paiement',
      'statut_paiement',
      'cree_par',
      'cree_le',
      'idempotency_key',
      'version',
    ] as const;
    await this.sauvegarderAgregatVersionne(
      paiement,
      'paiements',
      'id',
      paiement.obtenirId(),
      colonnes,
      this.extraireValeursTypage(ligne, colonnes),
    );
    await this.remplacerCollectionEnfants<RepartitionPaiement>(
      'repartitions_paiement',
      'id_paiement',
      paiement.obtenirId(),
      [
        'id',
        'id_paiement',
        'id_obligation',
        'montant',
        'devise',
        'ordre_affectation',
        'origine_affectation',
      ],
      paiement.obtenirRepartitions(),
      (repartition) => {
        const ligneRepartition =
          MappersPaiementsPostgres.versPersistanceRepartition(repartition);

        return [
          ligneRepartition.id,
          ligneRepartition.id_paiement,
          ligneRepartition.id_obligation,
          ligneRepartition.montant,
          ligneRepartition.devise,
          ligneRepartition.ordre_affectation,
          ligneRepartition.origine_affectation,
        ];
      },
    );
  }

  public async trouverParId(idPaiement: string): Promise<Paiement | null> {
    const ligne = await this.executerRequeteUnique<PersistancePaiementPostgres>(
      'SELECT * FROM "paiements" WHERE "id" = $1 LIMIT 1',
      [idPaiement],
    );

    if (ligne === null) {
      return null;
    }

    return this.marquerAgregatCharge(
      MappersPaiementsPostgres.depuisPersistancePaiement(
        ligne,
        await this.lireRepartitions(idPaiement),
      ),
    );
  }

  public async trouverParIdempotencyKey(
    idEcole: string,
    idempotencyKey: string,
  ): Promise<Paiement | null> {
    const ligne = await this.executerRequeteUnique<PersistancePaiementPostgres>(
      [
        'SELECT * FROM "paiements"',
        'WHERE "id_ecole" = $1 AND "idempotency_key" = $2',
        'LIMIT 1',
      ].join(' '),
      [idEcole, idempotencyKey],
    );

    if (ligne === null) {
      return null;
    }

    return this.marquerAgregatCharge(
      MappersPaiementsPostgres.depuisPersistancePaiement(
        ligne,
        await this.lireRepartitions(ligne.id),
      ),
    );
  }

  private async lireRepartitions(
    idPaiement: string,
  ): Promise<RepartitionPaiement[]> {
    const lignes =
      await this.executerRequete<PersistanceRepartitionPaiementPostgres>(
        [
          'SELECT * FROM "repartitions_paiement"',
          'WHERE "id_paiement" = $1',
          'ORDER BY "ordre_affectation" ASC',
        ].join(' '),
        [idPaiement],
      );

    return lignes.map((ligne) =>
      MappersPaiementsPostgres.depuisPersistanceRepartition(ligne));
  }

  private extraireValeursTypage<T extends object, K extends keyof T>(
    objet: T,
    cles: readonly K[],
  ): readonly unknown[] {
    return cles.map((cle) => objet[cle]);
  }
}
