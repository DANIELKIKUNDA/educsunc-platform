// Ce read-model optimise une lecture applicative du BC Audit.
export interface ForensicCorrelationReadModel { readonly correlationId?: string; readonly actions: readonly string[]; }
