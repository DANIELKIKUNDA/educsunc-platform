// Ce read-model optimise une lecture applicative du BC Audit.
export interface AuditSearchItemReadModel { readonly idAuditEntry: string; readonly action: string; readonly typeAuditPrincipal: string; readonly gravite: string; readonly resultat: string; readonly dateAction?: string; }
