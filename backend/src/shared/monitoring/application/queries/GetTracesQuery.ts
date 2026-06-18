import type { MonitoringContextInputDto } from '../dto/input';

// Ce fichier declare la query de lecture des traces.

/** Cette interface represente la query de lecture des traces. */
export interface GetTracesQuery {
  readonly contexte: MonitoringContextInputDto;
  readonly correlationId?: string;
}
