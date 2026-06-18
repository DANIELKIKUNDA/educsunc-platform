import type { TypeTrace } from '../../../../domain';
import type { DtoHttpMonitoringContext } from './DtoHttpMonitoringContext';

// Ce fichier declare le DTO HTTP de capture de trace.

/** Cette interface represente le payload HTTP de capture de trace. */
export interface DtoHttpCaptureTrace {
  readonly traceId: string;
  readonly type: TypeTrace;
  readonly operation: string;
  readonly succes: boolean;
  readonly dureeMillisecondes: number;
  readonly message?: string;
  readonly contexte: DtoHttpMonitoringContext;
  readonly correlationId: string;
}
