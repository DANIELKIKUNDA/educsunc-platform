import { schemasTablesLocalesEcoleReferentielAcademique } from '../schemas';
import { MigrationSchemaPostgresReferentielAcademique } from './MigrationPostgresReferentielAcademique';

// Cette migration cree les tables locales ecole du BC Referentiel Academique.
export const migration002TablesLocalesEcoleReferentielAcademique =
  new MigrationSchemaPostgresReferentielAcademique(
    '002_tables_locales_ecole_referentiel_academique',
    'Creation initiale des tables locales ecole du referentiel academique.',
    schemasTablesLocalesEcoleReferentielAcademique,
  );
