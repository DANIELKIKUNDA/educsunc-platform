// Ce fichier declare les statuts metier d une configuration.

/** Cette enumeration represente l etat courant d une configuration gouvernee. */
export const STATUTS_CONFIGURATION = ['BROUILLON', 'ACTIVE', 'LOCKED', 'ARCHIVED'] as const;

/** Cette union represente un statut de configuration valide. */
export type StatutConfiguration = (typeof STATUTS_CONFIGURATION)[number];
