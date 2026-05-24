import type { ForensicCorrelationReadModel } from './ForensicCorrelationReadModel';

// Ce read-model optimise une lecture applicative du BC Audit.
export interface AuditForensicReadModel {
  readonly investigationId: string;
  readonly resume: string;
  readonly correlations: readonly ForensicCorrelationReadModel[];
  readonly timelineIds?: readonly string[];
}
