import type { MonitoringContextInputDto } from '../dto/input';

// Ce fichier declare la query de lecture d observabilite.

/** Cette interface represente la query de lecture d un snapshot d observabilite. */
export interface GetObservabilitySnapshotQuery {
  readonly contexte: MonitoringContextInputDto;
}
