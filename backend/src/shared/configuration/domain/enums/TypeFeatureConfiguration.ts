// Ce fichier declare les fonctionnalites fines pilotables par configuration.

/** Cette enumeration represente les features officiellement identifiees par le domaine. */
export const TYPES_FEATURE_CONFIGURATION = [
  'BRANDING',
  'SIGNATURES',
  'PDF',
  'EXPORTS',
  'NOTIFICATION_TEMPLATES',
  'NOTIFICATION_BUDGETS',
  'RUNTIME_RELOAD',
  'SNAPSHOTS',
  'ROLLBACK',
] as const;

/** Cette union represente un type de feature configuration valide. */
export type TypeFeatureConfiguration = (typeof TYPES_FEATURE_CONFIGURATION)[number];
