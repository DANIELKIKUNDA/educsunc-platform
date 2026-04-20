export type StatutMigrationReferentiel = 'BROUILLON' | 'ANALYSEE' | 'APPLIQUEE' | 'ANNULEE';

export type TypeDiffReferentiel =
  | 'PONDERATION_MODIFIEE'
  | 'ORDRE_MODIFIE'
  | 'COURS_AJOUTE'
  | 'COURS_RETIRE'
  | 'COURS_DEVENU_NON_CALCULABLE';

export interface PonderationEvaluationResume {
  maxP1: number;
  maxP2: number;
  maxEX1: number;
  maxP3: number;
  maxP4: number;
  maxEX2: number;
  maxP5: number;
  maxP6: number;
  maxEX3: number;
}

export interface LigneDiffMigrationResume {
  typeDiff: TypeDiffReferentiel;
  codeCours: string;
  anciennePonderation?: PonderationEvaluationResume;
  nouvellePonderation?: PonderationEvaluationResume;
  ancienOrdre?: number;
  nouvelOrdre?: number;
  commentaire?: string;
}

export interface TransformationNoteResume {
  idNote: string;
  ancienneValeur: number;
  nouvelleValeur: number;
  ancienMaximum: number;
  nouveauMaximum: number;
  regleAppliquee: string;
  dateTransformation: string;
}

export interface MigrationReferentielResume {
  id: string;
  idProgrammeNiveau: string;
  idAncienneVersionReferentiel: string;
  idNouvelleVersionReferentiel: string;
  dateMigration: string;
  declenchePar?: string;
  statut: StatutMigrationReferentiel;
  resumeDiff: string;
  version: number;
  lignesDiffMigration: LigneDiffMigrationResume[];
  transformationsNotes: TransformationNoteResume[];
}

export interface RapportMigrationReferentielResume {
  migrationReferentielProgramme: MigrationReferentielResume;
  totalDifferences: number;
  totalTransformationsNotes: number;
}

export interface ReponseMigrationReferentiel {
  donnee: MigrationReferentielResume;
}

export interface ReponseRapportMigrationReferentiel {
  donnee: RapportMigrationReferentielResume;
}

export interface PaginationMigrationsReferentiel {
  total: number;
  page: number;
  taillePage: number;
  totalPages: number;
}

export interface ReponseListeMigrationsReferentiel {
  donnees: MigrationReferentielResume[];
  pagination: PaginationMigrationsReferentiel;
}
