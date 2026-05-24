// Cette taxonomy officielle classe les conflits observés dans les workflows offline et sync.
export const TYPE_CONFLIT_AUDIT_ENUM = [
  'VERSION_CONFLICT',
  'TENANT_CONFLICT',
  'PERMISSION_CONFLICT',
  'DONNEE_DEJA_MODIFIEE',
  'DOUBLON_IDEMPOTENT',
  'RESSOURCE_SUPPRIMEE_LOGIQUEMENT',
] as const;

export type TypeConflitAuditEnum = (typeof TYPE_CONFLIT_AUDIT_ENUM)[number];
