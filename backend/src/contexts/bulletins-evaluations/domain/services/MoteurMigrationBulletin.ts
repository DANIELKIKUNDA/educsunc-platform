import { MigrationBulletin } from '../aggregates/MigrationBulletin';
import { DiffColonneBulletin } from '../entities/DiffColonneBulletin';
import { TransformationCoteBulletin } from '../entities/TransformationCoteBulletin';

// Ce moteur pilote l'analyse et l'application d'une migration de bulletin.
export class MoteurMigrationBulletin {
  // Cette methode alimente l'analyse avec les differences detectees.
  public analyser(migration: MigrationBulletin, differences: DiffColonneBulletin[]): void {
    migration.analyser(differences);
  }

  // Cette methode attache les transformations calculees avant application.
  public convertirCotes(migration: MigrationBulletin, transformations: TransformationCoteBulletin[]): void {
    migration.convertirCotes(transformations);
  }

  // Cette methode applique la migration deja preparee.
  public appliquer(migration: MigrationBulletin): void {
    migration.appliquer();
  }
}
