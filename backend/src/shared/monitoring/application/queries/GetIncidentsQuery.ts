import type { MonitoringContextInputDto } from '../dto/input';

// Ce fichier declare la query de lecture des incidents.

/** Cette interface represente la query de lecture des incidents. */
export interface GetIncidentsQuery {
  readonly contexte: MonitoringContextInputDto;
}
