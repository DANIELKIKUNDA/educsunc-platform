// Ce read-model optimise une lecture applicative du BC Audit.
export interface AuditSearchFiltersReadModel { readonly action?: string; readonly typeAuditPrincipal?: string; readonly organisationId?: string; readonly ecoleId?: string; }
