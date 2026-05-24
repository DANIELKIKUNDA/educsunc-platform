// Cette taxonomy officielle décrit la nature d'exécution de l'opération auditée.
export const TYPE_EXECUTION_AUDIT_ENUM = [
  'SYNCHRONE',
  'ASYNCHRONE',
  'BATCH',
  'QUEUE',
  'RETRY',
  'REPLAY',
  'IMPORT',
  'EXPORT',
  'MIGRATION',
] as const;

export type TypeExecutionAuditEnum = (typeof TYPE_EXECUTION_AUDIT_ENUM)[number];
