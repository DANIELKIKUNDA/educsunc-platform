// Ce fichier declare les modules metier configurables par EducSyn.

/** Cette enumeration represente les modules activables commercialement. */
export const TYPES_MODULE_CONFIGURATION = [
  'REFERENTIEL_ACADEMIQUE',
  'SCOLARITE_ELEVES',
  'PAIEMENTS_FACTURATION',
  'BULLETINS_EVALUATIONS',
  'NOTIFICATIONS',
  'AUDIT',
  'MONITORING',
] as const;

/** Cette union represente un type de module configuration valide. */
export type TypeModuleConfiguration = (typeof TYPES_MODULE_CONFIGURATION)[number];
