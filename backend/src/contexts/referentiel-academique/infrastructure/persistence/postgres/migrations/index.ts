export * from './MigrationPostgresReferentielAcademique';
export * from './Migration_001_TablesGlobalesReferentielAcademique';
export * from './Migration_002_TablesLocalesEcoleReferentielAcademique';
export * from './Migration_003_TablesTechniquesAssocieesReferentielAcademique';
export * from './Migration_004_AlignementVersionsReferentielProgramme';
export * from './Migration_005_NettoyageLegacyReferentielProgramme';
export * from './Migration_006_RlsTablesLocalesReferentielAcademique';
export * from './Migration_007_AjoutAbreviationOptionsEtudes';
export * from './Migration_008_AjoutClassificationLignesProgramme';
export * from './Migration_009_ReglesFraisClasses';
export * from './Migration_010_CategorieTechniqueOptions';

import { MigrationPostgresReferentielAcademique } from './MigrationPostgresReferentielAcademique';
import { migration001TablesGlobalesReferentielAcademique } from './Migration_001_TablesGlobalesReferentielAcademique';
import { migration002TablesLocalesEcoleReferentielAcademique } from './Migration_002_TablesLocalesEcoleReferentielAcademique';
import { migration003TablesTechniquesAssocieesReferentielAcademique } from './Migration_003_TablesTechniquesAssocieesReferentielAcademique';
import { migration004AlignementVersionsReferentielProgramme } from './Migration_004_AlignementVersionsReferentielProgramme';
import { migration005NettoyageLegacyReferentielProgramme } from './Migration_005_NettoyageLegacyReferentielProgramme';
import { migration006RlsTablesLocalesReferentielAcademique } from './Migration_006_RlsTablesLocalesReferentielAcademique';
import { migration007AjoutAbreviationOptionsEtudes } from './Migration_007_AjoutAbreviationOptionsEtudes';
import { migration008AjoutClassificationLignesProgramme } from './Migration_008_AjoutClassificationLignesProgramme';
import { migration009ReglesFraisClasses } from './Migration_009_ReglesFraisClasses';
import { migration010CategorieTechniqueOptions } from './Migration_010_CategorieTechniqueOptions';

// Cette collection ordonne les migrations PostgreSQL du BC Referentiel Academique.
export const migrationsPostgresReferentielAcademique: readonly MigrationPostgresReferentielAcademique[] = [
  migration001TablesGlobalesReferentielAcademique,
  migration002TablesLocalesEcoleReferentielAcademique,
  migration003TablesTechniquesAssocieesReferentielAcademique,
  migration004AlignementVersionsReferentielProgramme,
  migration005NettoyageLegacyReferentielProgramme,
  migration006RlsTablesLocalesReferentielAcademique,
  migration007AjoutAbreviationOptionsEtudes,
  migration008AjoutClassificationLignesProgramme,
  migration009ReglesFraisClasses,
  migration010CategorieTechniqueOptions,
];
