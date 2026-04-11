// Ce DTO represente les donnees attendues pour relancer un recalcul apres migration.
export interface RelancerRecalculApresMigrationEntree {
  idMigrationReferentielProgramme: string;
  relancePar: string;
}
