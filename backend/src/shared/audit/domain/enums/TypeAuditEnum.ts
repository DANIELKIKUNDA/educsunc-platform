// Cette taxonomy officielle liste les types d'audit reconnus par le domaine.
export const TYPE_AUDIT_ENUM = [
  'METIER',
  'SECURITE',
  'FINANCIER',
  'PEDAGOGIQUE',
  'ADMINISTRATIF',
  'SYNCHRONISATION',
  'SYSTEME',
  'EXPORT',
  'CONSULTATION_SENSIBLE',
  'CONFORMITE',
] as const;

export type TypeAuditEnum = (typeof TYPE_AUDIT_ENUM)[number];
