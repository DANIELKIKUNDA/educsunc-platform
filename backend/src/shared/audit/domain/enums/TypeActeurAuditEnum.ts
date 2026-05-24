// Cette taxonomy officielle décrit la nature de l'acteur responsable.
export const TYPE_ACTEUR_AUDIT_ENUM = [
  'UTILISATEUR',
  'SYSTEME',
  'WORKER',
  'SYNC_ENGINE',
  'CRON',
  'IMPORT',
  'MIGRATION',
  'OFFLINE_DEVICE',
] as const;

export type TypeActeurAuditEnum = (typeof TYPE_ACTEUR_AUDIT_ENUM)[number];
