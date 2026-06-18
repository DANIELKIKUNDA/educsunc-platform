import type { MonitoringContextInputDto } from '../dto/input';

// Ce fichier declare la query de lecture du tableau de bord Monitoring.

/** Cette interface represente la query de lecture du tableau de bord Monitoring. */
export interface GetDashboardMonitoringQuery {
  readonly contexte: MonitoringContextInputDto;
}
