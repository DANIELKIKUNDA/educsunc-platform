import { MigrationReferentielProgrammeSortie } from './MigrationReferentielProgrammeSortie';

// Ce DTO represente la liste paginee des migrations d'un programme niveau.
export interface ListerMigrationsReferentielParProgrammeNiveauSortie {
  migrationsReferentielProgramme: MigrationReferentielProgrammeSortie[];
  total: number;
  page: number;
  taillePage: number;
}
