// Cette taxonomy officielle identifie la source runtime de l'action auditée.
export const SOURCE_AUDIT_ENUM = [
  'HTTP_API',
  'SYNC_ENGINE',
  'WORKER',
  'CRON',
  'SYSTEM',
  'OFFLINE_DEVICE',
  'IMPORT',
  'EXPORT',
  'MIGRATION',
] as const;

export type SourceAuditEnum = (typeof SOURCE_AUDIT_ENUM)[number];
