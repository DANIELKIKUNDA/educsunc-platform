import type { AuditEntryOutput } from './AuditEntryOutput';

// Ce DTO de sortie formalise une reponse applicative Audit.
export interface AuditTimelineOutput {
  readonly correlationId?: string;
  readonly ressource?: string;
  readonly acteur?: string;
  readonly timeline: readonly AuditEntryOutput[];
  readonly items: readonly AuditEntryOutput[];
  readonly nextCursor?: string;
  readonly hasNextPage: boolean;
}
