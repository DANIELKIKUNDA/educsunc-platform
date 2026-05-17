import { MigrationBulletin } from '../aggregates/MigrationBulletin';

// Ce contrat abstrait la persistence des migrations de bulletin.
export interface DepotMigrationBulletin {
  sauvegarder(migrationBulletin: MigrationBulletin): Promise<void>;
  trouverParId(idMigrationBulletin: string): Promise<MigrationBulletin | null>;
  listerParClasseEtAnnee(idClassePedagogique: string, idAnneeScolaire: string): Promise<MigrationBulletin[]>;
  trouverMigrationAppliquee(idClassePedagogique: string, idAnneeScolaire: string, ancienneVersionReferentiel: string, nouvelleVersionReferentiel: string): Promise<MigrationBulletin | null>;
}
