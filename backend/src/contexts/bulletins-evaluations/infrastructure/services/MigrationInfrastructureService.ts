import type { MigrationBulletinReadModel } from 'contexts/bulletins-evaluations/application/read-models/MigrationBulletinReadModel';
import { obtenirMemoireTechniqueBulletins } from '../persistence/postgres/depots/outilsDepotBulletin';

// Ce fichier coordonne les traces techniques locales des migrations de bulletin.
export class MigrationInfrastructureService {
  // Cette methode memorise la derniere vue technique connue d'une migration.
  public memoriserMigration(migration: MigrationBulletinReadModel): MigrationBulletinReadModel {
    obtenirMemoireTechniqueBulletins().journauxProjection.set(
      `migration:${migration.idMigrationBulletin}`,
      new Date(),
    );
    return migration;
  }
}
