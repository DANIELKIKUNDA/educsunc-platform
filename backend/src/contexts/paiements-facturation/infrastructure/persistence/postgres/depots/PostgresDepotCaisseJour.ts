import { CaisseJour } from '../../../../domain/aggregates/CaisseJour';
import type { OperationCaisse } from '../../../../domain/entities/OperationCaisse';
import type { DepotCaisseJour } from '../../../../domain/repositories/DepotCaisseJour';
import { BaseDepotPostgresPaiementsFacturation } from './BaseDepotPostgresPaiementsFacturation';
import type { ClientPostgresPaiementsFacturation } from './ClientPostgresPaiementsFacturation';
import type { PostgresUnitOfWork } from '../transaction/PostgresUnitOfWork';
import type { PaiementTenantContext } from '../../../tenancy/PaiementTenantContext';
import {
  MappersPaiementsPostgres,
  type PersistanceCaisseJourPostgres,
  type PersistanceOperationCaissePostgres,
} from '../mappers/MappersPaiementsPostgres';

// Ce depot persiste la caisse journaliere et ses operations detaillees.
export class PostgresDepotCaisseJour
  extends BaseDepotPostgresPaiementsFacturation
  implements DepotCaisseJour
{
  constructor(
    clientLecture: ClientPostgresPaiementsFacturation,
    uniteDeTravail?: PostgresUnitOfWork<ClientPostgresPaiementsFacturation>,
    contexteTenant?: PaiementTenantContext,
  ) {
    super(clientLecture, uniteDeTravail, contexteTenant);
  }

  public async sauvegarder(caisseJour: CaisseJour): Promise<void> {
    this.verifierEcritureLocaleAutorisee(caisseJour.obtenirIdEcole());
    const ligne = MappersPaiementsPostgres.versPersistanceCaisse(caisseJour);
    const colonnes = [
      'id',
      'id_ecole',
      'date_caisse',
      'statut',
      'total_encaisse',
      'total_cash',
      'total_mobile_money',
      'total_par_caissier',
      'total_fonds_anticipes',
      'total_fonds_consommes',
      'disponible_reel',
      'ouverte_par',
      'ouverte_le',
      'cloturee_par',
      'cloturee_le',
      'version',
    ] as const;
    await this.sauvegarderAgregatVersionne(
      caisseJour,
      'caisse_jour',
      'id',
      caisseJour.obtenirId(),
      colonnes,
      this.extraireValeursTypage(ligne, colonnes),
    );
    await this.remplacerCollectionEnfants<OperationCaisse>(
      'operations_caisse',
      'id_caisse_jour',
      caisseJour.obtenirId(),
      [
        'id',
        'id_caisse_jour',
        'id_paiement',
        'id_restitution',
        'id_annulation',
        'type_operation',
        'montant',
        'devise',
        'mode_paiement',
        'id_caissier',
        'date_operation',
      ],
      caisseJour.obtenirOperations(),
      (operation) => {
        const ligneOperation =
          MappersPaiementsPostgres.versPersistanceOperationCaisse(operation);

        return [
          ligneOperation.id,
          caisseJour.obtenirId(),
          ligneOperation.id_paiement,
          ligneOperation.id_restitution,
          ligneOperation.id_annulation,
          ligneOperation.type_operation,
          ligneOperation.montant,
          ligneOperation.devise,
          ligneOperation.mode_paiement,
          ligneOperation.id_caissier,
          ligneOperation.date_operation,
        ];
      },
    );
  }

  public async trouverParId(idCaisseJour: string): Promise<CaisseJour | null> {
    const ligne = await this.executerRequeteUnique<PersistanceCaisseJourPostgres>(
      'SELECT * FROM "caisse_jour" WHERE "id" = $1 LIMIT 1',
      [idCaisseJour],
    );

    if (ligne === null) {
      return null;
    }

    return this.marquerAgregatCharge(
      MappersPaiementsPostgres.depuisPersistanceCaisse(
        ligne,
        await this.lireOperations(ligne.id),
      ),
    );
  }

  public async trouverActiveParEcoleEtDate(
    idEcole: string,
    dateCaisse: string,
  ): Promise<CaisseJour | null> {
    const ligne = await this.executerRequeteUnique<PersistanceCaisseJourPostgres>(
      [
        'SELECT * FROM "caisse_jour"',
        'WHERE "id_ecole" = $1 AND "date_caisse" = $2',
        'LIMIT 1',
      ].join(' '),
      [idEcole, dateCaisse],
    );

    if (ligne === null) {
      return null;
    }

    return this.marquerAgregatCharge(
      MappersPaiementsPostgres.depuisPersistanceCaisse(
        ligne,
        await this.lireOperations(ligne.id),
      ),
    );
  }

  private async lireOperations(idCaisseJour: string): Promise<OperationCaisse[]> {
    const lignes = await this.executerRequete<PersistanceOperationCaissePostgres>(
      [
        'SELECT * FROM "operations_caisse"',
        'WHERE "id_caisse_jour" = $1',
        'ORDER BY "date_operation" ASC',
      ].join(' '),
      [idCaisseJour],
    );

    return lignes.map((ligne) =>
      MappersPaiementsPostgres.depuisPersistanceOperationCaisse(ligne));
  }

  private extraireValeursTypage<T extends object, K extends keyof T>(
    objet: T,
    cles: readonly K[],
  ): readonly unknown[] {
    return cles.map((cle) => objet[cle]);
  }
}
