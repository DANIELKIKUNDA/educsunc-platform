import { MoteurMigrationBulletin } from '../../domain/services/MoteurMigrationBulletin';
import type { MigrationBulletin } from '../../domain/aggregates/MigrationBulletin';
import type { DiffColonneBulletin } from '../../domain/entities/DiffColonneBulletin';
import type { TransformationCoteBulletin } from '../../domain/entities/TransformationCoteBulletin';

// Ce service coordonne l'analyse et l'application applicative des migrations.
export class ServiceMigrationBulletin {
  constructor(private readonly moteurMigration = new MoteurMigrationBulletin()) {}

  // Cette methode pousse l'analyse des differences dans l'agregat de migration.
  public analyser(migration: MigrationBulletin, differences: DiffColonneBulletin[]): void {
    this.moteurMigration.analyser(migration, differences);
  }

  // Cette methode pousse les transformations calculees dans l'agregat de migration.
  public convertir(migration: MigrationBulletin, transformations: TransformationCoteBulletin[]): void {
    this.moteurMigration.convertirCotes(migration, transformations);
  }

  // Cette methode applique la migration deja preparee.
  public appliquer(migration: MigrationBulletin): void {
    this.moteurMigration.appliquer(migration);
  }
}
