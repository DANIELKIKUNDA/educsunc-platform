// Cette taxonomy officielle décrit les formats d'export sensibles suivis par l'audit.
export const TYPE_EXPORT_AUDIT_ENUM = ['CSV', 'EXCEL', 'PDF', 'JSON', 'ZIP'] as const;

export type TypeExportAuditEnum = (typeof TYPE_EXPORT_AUDIT_ENUM)[number];
