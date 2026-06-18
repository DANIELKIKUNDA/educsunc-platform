import type { ResultatExecutionWorkerNotification } from '../../../infrastructure/workers';
import type {
  NotificationMonitoringIntegrationRecord,
  NotificationWorkerMonitoringSnapshot,
} from '../NotificationsMonitoringIntegrationTypes';

// Ce fichier consolide les executions workers de Notifications pour le monitoring transverse.

/** Cette classe traduit les cycles workers en vue de monitoring d'integration. */
export class NotificationWorkerMonitoringBridge {
  /** Cette methode construit la vue monitoring workers a partir des cycles recents et des observations. */
  public construireSnapshot(
    derniersCycles: readonly ResultatExecutionWorkerNotification[],
    observations: readonly NotificationMonitoringIntegrationRecord[],
  ): NotificationWorkerMonitoringSnapshot {
    const observationsWorkers = observations.filter((observation) => observation.source === 'WORKERS');
    const totalJobsTraites = derniersCycles.reduce((total, cycle) => total + cycle.totalTraites, 0);
    const totalEchecs =
      derniersCycles.reduce((total, cycle) => total + cycle.totalEchecs, 0) +
      observationsWorkers.filter((observation) => observation.niveau === 'ERROR').length;

    return {
      derniersCycles: [...derniersCycles],
      totalCycles: derniersCycles.length,
      totalJobsTraites,
      totalEchecs,
    };
  }
}
