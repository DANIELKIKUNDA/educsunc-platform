import { SchemaTablePostgres } from './SchemaPostgres';
import { schemasTablesGlobalesReferentielAcademique } from './SchemasTablesGlobales';
import { schemasTablesLocalesEcoleReferentielAcademique } from './SchemasTablesLocalesEcole';
import { schemasTablesTechniquesAssocieesReferentielAcademique } from './SchemasTablesTechniquesAssociees';

export * from './SchemaPostgres';
export * from './SchemasTablesGlobales';
export * from './SchemasTablesLocalesEcole';
export * from './SchemasTablesTechniquesAssociees';

// Cette collection regroupe tous les schemas PostgreSQL du BC Referentiel Academique.
export const schemasTablesPostgresReferentielAcademique: readonly SchemaTablePostgres[] = [
  ...schemasTablesGlobalesReferentielAcademique,
  ...schemasTablesLocalesEcoleReferentielAcademique,
  ...schemasTablesTechniquesAssocieesReferentielAcademique,
];
