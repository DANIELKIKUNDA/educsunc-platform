// Ce read-model optimise une lecture applicative du BC Audit.
export interface SynchronizationConflictReadModel { readonly auditId: string; readonly raison: string; readonly resolution?: string; }
