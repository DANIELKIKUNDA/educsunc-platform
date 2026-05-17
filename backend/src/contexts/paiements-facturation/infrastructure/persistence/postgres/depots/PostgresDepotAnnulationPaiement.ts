import { AnnulationPaiement } from '../../../../domain/aggregates/AnnulationPaiement';
import type { OperationInverse } from '../../../../domain/entities/OperationInverse';
import type { DepotAnnulationPaiement } from '../../../../domain/repositories/DepotAnnulationPaiement';
import { BaseDepotPostgresPaiementsFacturation } from './BaseDepotPostgresPaiementsFacturation';
import type { ClientPostgresPaiementsFacturation } from './ClientPostgresPaiementsFacturation';
import type { PostgresUnitOfWork } from '../transaction/PostgresUnitOfWork';
import type { PaiementTenantContext } from '../../../tenancy/PaiementTenantContext';
import {
  MappersPaiementsPostgres,
  type PersistanceAnnulationPaiementPostgres,
  type PersistanceOperationInversePostgres,
} from '../mappers/MappersPaiementsPostgres';

// Ce depot persiste les annulations de paiements et leurs operations inverses.
export class PostgresDepotAnnulationPaiement
  extends BaseDepotPostgresPaiementsFacturation
  implements DepotAnnulationPaiement
{
  constructor(
    clientLecture: ClientPostgresPaiementsFacturation,
    uniteDeTravail?: PostgresUnitOfWork<ClientPostgresPaiementsFacturation>,
    contexteTenant?: PaiementTenantContext,
  ) {
    super(clientLecture, uniteDeTravail, contexteTenant);
  }

  public async sauvegarder(annulationPaiement: AnnulationPaiement): Promise<void> {
    this.verifierEcritureLocaleAutorisee(annulationPaiement.obtenirIdEcole());
    const ligne = MappersPaiementsPostgres.versPersistanceAnnulation(annulationPaiement);

    await this.executerCommande(
      [
        'INSERT INTO "annulations_paiement"',
        '("id", "id_paiement", "id_ecole", "raison", "annule_par", "annule_le")',
        'VALUES ($1, $2, $3, $4, $5, $6)',
        'ON CONFLICT ("id") DO UPDATE SET',
        '"id_paiement" = EXCLUDED."id_paiement",',
        '"id_ecole" = EXCLUDED."id_ecole",',
        '"raison" = EXCLUDED."raison",',
        '"annule_par" = EXCLUDED."annule_par",',
        '"annule_le" = EXCLUDED."annule_le"',
      ].join(' '),
      [
        ligne.id,
        ligne.id_paiement,
        ligne.id_ecole,
        ligne.raison,
        ligne.annule_par,
        ligne.annule_le,
      ],
    );

    await this.remplacerCollectionEnfants<OperationInverse>(
      'operations_inverses_paiement',
      'id_annulation',
      annulationPaiement.obtenirId(),
      [
        'id_annulation',
        'id_operation_origine',
        'id_operation_inverse',
        'type_operation',
        'montant',
        'devise',
        'mode_paiement',
        'cree_le',
      ],
      annulationPaiement.obtenirOperationsInverses(),
      (operationInverse) => {
        const ligneOperation =
          MappersPaiementsPostgres.versPersistanceOperationInverse(
            operationInverse,
          );

        return [
          annulationPaiement.obtenirId(),
          ligneOperation.id_operation_origine,
          ligneOperation.id_operation_inverse,
          ligneOperation.type_operation,
          ligneOperation.montant,
          ligneOperation.devise,
          ligneOperation.mode_paiement,
          ligneOperation.cree_le,
        ];
      },
    );
  }

  public async trouverParId(
    idAnnulation: string,
  ): Promise<AnnulationPaiement | null> {
    const ligne =
      await this.executerRequeteUnique<PersistanceAnnulationPaiementPostgres>(
        'SELECT * FROM "annulations_paiement" WHERE "id" = $1 LIMIT 1',
        [idAnnulation],
      );

    if (ligne === null) {
      return null;
    }

    return MappersPaiementsPostgres.depuisPersistanceAnnulation(
      ligne,
      await this.lireOperationsInverses(ligne.id),
    );
  }

  public async trouverParPaiement(
    idPaiement: string,
  ): Promise<AnnulationPaiement | null> {
    const ligne =
      await this.executerRequeteUnique<PersistanceAnnulationPaiementPostgres>(
        [
          'SELECT * FROM "annulations_paiement"',
          'WHERE "id_paiement" = $1',
          'LIMIT 1',
        ].join(' '),
        [idPaiement],
      );

    if (ligne === null) {
      return null;
    }

    return MappersPaiementsPostgres.depuisPersistanceAnnulation(
      ligne,
      await this.lireOperationsInverses(ligne.id),
    );
  }

  private async lireOperationsInverses(
    idAnnulation: string,
  ): Promise<OperationInverse[]> {
    const lignes =
      await this.executerRequete<PersistanceOperationInversePostgres>(
        [
          'SELECT * FROM "operations_inverses_paiement"',
          'WHERE "id_annulation" = $1',
          'ORDER BY "cree_le" ASC',
        ].join(' '),
        [idAnnulation],
      );

    return lignes.map((ligne) =>
      MappersPaiementsPostgres.depuisPersistanceOperationInverse(ligne));
  }
}
