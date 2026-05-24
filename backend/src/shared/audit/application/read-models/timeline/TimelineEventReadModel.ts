// Ce read-model optimise une lecture applicative du BC Audit.
export interface TimelineEventReadModel { readonly idAuditEntry: string; readonly action: string; readonly dateAction?: string; readonly resultat: string; }
