import type { VueSurveillanceFilesNotifications } from '../../../infrastructure/monitoring';
import type {
  NotificationMonitoringIntegrationRecord,
  NotificationQueueMonitoringSnapshot,
} from '../NotificationsMonitoringIntegrationTypes';

// Ce fichier consolide les signaux files de Notifications pour le monitoring transverse.

/** Cette classe traduit la supervision des files en snapshot d'integration monitoring. */
export class NotificationQueueMonitoringBridge {
  /** Cette methode construit la vue monitoring des files a partir du snapshot technique et des observations. */
  public construireSnapshot(
    observationTechnique: VueSurveillanceFilesNotifications | undefined,
    observations: readonly NotificationMonitoringIntegrationRecord[],
  ): NotificationQueueMonitoringSnapshot {
    const observationsQueues = observations.filter((observation) => observation.source === 'QUEUES');
    return {
      observationTechnique,
      totalObservationsQueues: observationsQueues.length,
      totalSaturations:
        observationsQueues.filter((observation) => observation.donnees.saturationDetectee === true).length +
        (observationTechnique?.saturationDetectee ? 1 : 0),
      totalDeadLettersSignales:
        observationsQueues.filter((observation) =>
          Number.isFinite(observation.donnees.totalDeadLetter as number | undefined),
        ).reduce((total, observation) => total + Number(observation.donnees.totalDeadLetter), 0) +
        (observationTechnique?.totalDeadLetter ?? 0),
    };
  }
}
