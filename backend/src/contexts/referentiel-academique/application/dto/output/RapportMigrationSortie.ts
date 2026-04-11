import { MigrationReferentielProgrammeSortie } from './MigrationReferentielProgrammeSortie';

// Ce DTO represente la forme de sortie standard d'un rapport de migration.
export interface RapportMigrationSortie {
  migrationReferentielProgramme: MigrationReferentielProgrammeSortie;
  totalDifferences: number;
  totalTransformationsNotes: number;
}
