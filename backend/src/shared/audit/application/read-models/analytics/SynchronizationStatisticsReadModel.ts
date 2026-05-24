// Ce read-model optimise une lecture applicative du BC Audit.
export interface SynchronizationStatisticsReadModel { readonly synchronises: number; readonly conflits: number; readonly retries: number; }
