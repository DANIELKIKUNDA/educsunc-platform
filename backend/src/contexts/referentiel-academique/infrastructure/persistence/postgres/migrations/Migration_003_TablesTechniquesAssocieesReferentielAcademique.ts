import { schemasTablesTechniquesAssocieesReferentielAcademique } from '../schemas';
import { MigrationSchemaPostgresReferentielAcademique } from './MigrationPostgresReferentielAcademique';

// Cette migration cree les tables techniques associees du BC Referentiel Academique.
export const migration003TablesTechniquesAssocieesReferentielAcademique =
  new MigrationSchemaPostgresReferentielAcademique(
    '003_tables_techniques_associees_referentiel_academique',
    'Creation initiale des tables techniques associees du referentiel academique.',
    schemasTablesTechniquesAssocieesReferentielAcademique,
  );
