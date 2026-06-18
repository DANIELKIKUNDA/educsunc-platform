import type { MonitoringContextInputDto } from '../dto/input';

// Ce fichier declare la query de lecture de capacite.

/** Cette interface represente la query de lecture de capacite. */
export interface GetCapacityQuery {
  readonly contexte: MonitoringContextInputDto;
}
