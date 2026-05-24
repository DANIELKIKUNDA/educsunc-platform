// Cette taxonomy officielle décrit l'issue finale d'une action auditée.
export const RESULTAT_AUDIT_ENUM = [
  'SUCCESS',
  'FAILED',
  'REFUSED',
  'CANCELLED',
  'CONFLICT',
  'RETRIED',
  'REPLAYED',
  'IGNORED_DUPLICATE',
] as const;

export type ResultatAuditEnum = (typeof RESULTAT_AUDIT_ENUM)[number];
