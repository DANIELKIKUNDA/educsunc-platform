// Ce fichier declare les statuts de licence configuration.

/** Cette enumeration represente l etat commercial d une licence d ecole. */
export const STATUTS_LICENCE_CONFIGURATION = [
  'ACTIVE',
  'SUSPENDED',
  'EXPIRED',
  'TRIAL',
] as const;

/** Cette union represente un statut de licence valide. */
export type StatutLicenceConfiguration = (typeof STATUTS_LICENCE_CONFIGURATION)[number];
