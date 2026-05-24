import type { AuditEntryOutput } from './AuditEntryOutput';

// Ce DTO de sortie formalise une reponse applicative Audit.
export interface AuditForensicOutput {
  readonly investigationId: string;
  readonly resume: string;
  readonly correlations: readonly {
    readonly correlationId?: string;
    readonly actions: readonly string[];
  }[];
  readonly timeline?: readonly AuditEntryOutput[];
  readonly indicateurs?: Record<string, number>;
}
