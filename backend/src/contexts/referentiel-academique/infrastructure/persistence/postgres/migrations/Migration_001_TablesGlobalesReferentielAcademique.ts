import { schemasTablesGlobalesReferentielAcademique } from '../schemas';
import { MigrationSchemaPostgresReferentielAcademique } from './MigrationPostgresReferentielAcademique';

// Cette migration cree les tables globales du BC Referentiel Academique.
export const migration001TablesGlobalesReferentielAcademique =
  new MigrationSchemaPostgresReferentielAcademique(
    '001_tables_globales_referentiel_academique',
    'Creation initiale des tables globales du referentiel academique.',
    schemasTablesGlobalesReferentielAcademique,
  );
