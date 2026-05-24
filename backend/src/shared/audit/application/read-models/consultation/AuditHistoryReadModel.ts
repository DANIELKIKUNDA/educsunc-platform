import type { AuditEntryOutput } from '../../dto/outputs/AuditEntryOutput';

// Ce read-model optimise une lecture applicative du BC Audit.
export interface AuditHistoryReadModel {
  readonly items: readonly AuditEntryOutput[];
  readonly total: number;
  readonly correlationId?: string;
}
