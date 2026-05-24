// Cette taxonomie officielle fixe les niveaux d'isolation multi-tenant.
export const TENANT_AUDIT_SCOPE_ENUM = ['PLATEFORME', 'ORGANISATION', 'ECOLE'] as const;

export type TenantAuditScopeEnum = (typeof TENANT_AUDIT_SCOPE_ENUM)[number];
