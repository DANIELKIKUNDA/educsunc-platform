// Ce fichier declare les niveaux de configuration officiellement supportes.

/** Cette enumeration represente la hierarchie officielle des portees de configuration. */
export const NIVEAUX_CONFIGURATION = ['SYSTEM', 'ORGANIZATION', 'SCHOOL', 'USER'] as const;

/** Cette union represente un niveau de configuration valide. */
export type NiveauConfiguration = (typeof NIVEAUX_CONFIGURATION)[number];
