export type StatutMigrationReferentiel = 'ANALYSEE' | 'APPLIQUEE' | 'ANNULEE';

export interface MigrationReferentielResume {
  id: string;
  statut: StatutMigrationReferentiel;
  creeLe: string;
}
