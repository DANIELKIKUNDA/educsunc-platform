import { MigrationBulletin } from 'contexts/bulletins-evaluations/domain/aggregates/MigrationBulletin';
import type { DepotMigrationBulletin } from 'contexts/bulletins-evaluations/domain/repositories/DepotMigrationBulletin';

// Ce fichier fournit un depot PostgreSQL simplifie pour les migrations de bulletin.
export class PostgresDepotMigrationBulletin implements DepotMigrationBulletin {
  private static readonly stockage = new Map<string, MigrationBulletin>();

  public async sauvegarder(migrationBulletin: MigrationBulletin): Promise<void> {
    PostgresDepotMigrationBulletin.stockage.set(migrationBulletin.obtenirId(), migrationBulletin);
  }

  public async trouverParId(idMigrationBulletin: string): Promise<MigrationBulletin | null> {
    return PostgresDepotMigrationBulletin.stockage.get(idMigrationBulletin) ?? null;
  }

  public async listerParClasseEtAnnee(idClassePedagogique: string, idAnneeScolaire: string): Promise<MigrationBulletin[]> {
    return [...PostgresDepotMigrationBulletin.stockage.values()].filter((migration) =>
      String(Reflect.get(migration, 'idClassePedagogique') ?? '') === idClassePedagogique
      && String(Reflect.get(migration, 'idAnneeScolaire') ?? '') === idAnneeScolaire,
    );
  }

  public async trouverMigrationAppliquee(
    idClassePedagogique: string,
    idAnneeScolaire: string,
    ancienneVersionReferentiel: string,
    nouvelleVersionReferentiel: string,
  ): Promise<MigrationBulletin | null> {
    return [...PostgresDepotMigrationBulletin.stockage.values()].find((migration) =>
      String(Reflect.get(migration, 'idClassePedagogique') ?? '') === idClassePedagogique
      && String(Reflect.get(migration, 'idAnneeScolaire') ?? '') === idAnneeScolaire
      && String(Reflect.get(migration, 'ancienneVersionReferentiel') ?? '') === ancienneVersionReferentiel
      && String(Reflect.get(migration, 'nouvelleVersionReferentiel') ?? '') === nouvelleVersionReferentiel
      && String(Reflect.get(migration, 'statutMigration') ?? '') === 'APPLIQUEE',
    ) ?? null;
  }
}
