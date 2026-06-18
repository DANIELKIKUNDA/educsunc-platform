import type { MonitoringContextInputDto } from './MonitoringContextInputDto';

// Ce fichier declare le DTO d entree de capture de trace.

/** Cette interface represente le DTO de capture de trace. */
export interface CaptureTraceInputDto {
  readonly traceId: string;
  readonly type: import('../../../domain').TypeTrace;
  readonly operation: string;
  readonly succes: boolean;
  readonly dureeMillisecondes: number;
  readonly message?: string;
  readonly contexte: MonitoringContextInputDto;
  readonly correlationId: string;
}
