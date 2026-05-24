import type { AuditEntryOutput } from '../../dto/outputs/AuditEntryOutput';

// Ce read-model optimise une lecture applicative du BC Audit.
export interface AuditEntryDetailsReadModel {
  readonly audit: AuditEntryOutput;
  readonly ancienEtat?: unknown;
  readonly nouvelEtat?: unknown;
  readonly metadata?: Record<string, unknown>;
}
