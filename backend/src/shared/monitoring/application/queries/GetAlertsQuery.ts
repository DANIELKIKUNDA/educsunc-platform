import type { MonitoringContextInputDto } from '../dto/input';

// Ce fichier declare la query de lecture des alertes.

/** Cette interface represente la query de lecture des alertes. */
export interface GetAlertsQuery {
  readonly contexte: MonitoringContextInputDto;
  readonly statuts?: readonly string[];
}
