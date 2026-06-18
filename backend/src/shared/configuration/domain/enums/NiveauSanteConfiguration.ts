// Ce fichier declare les niveaux de sante du module Configuration.

/** Cette enumeration represente la sante observable du module Configuration. */
export const NIVEAUX_SANTE_CONFIGURATION = [
  'HEALTHY',
  'WARNING',
  'DEGRADED',
  'CRITICAL',
] as const;

/** Cette union represente un niveau de sante valide. */
export type NiveauSanteConfiguration = (typeof NIVEAUX_SANTE_CONFIGURATION)[number];
