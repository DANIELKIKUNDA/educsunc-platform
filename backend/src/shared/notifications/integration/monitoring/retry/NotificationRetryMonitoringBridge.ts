import type { ResultatExecutionRetryNotification } from '../../../infrastructure/retry';
import type {
  NotificationMonitoringIntegrationRecord,
  NotificationRetryMonitoringSnapshot,
} from '../NotificationsMonitoringIntegrationTypes';

// Ce fichier consolide les retries Notifications pour le monitoring transverse.

/** Cette classe traduit les resultats de retry en vue de supervision partageable. */
export class NotificationRetryMonitoringBridge {
  /** Cette methode construit la vue monitoring des retries a partir des derniers resultats et observations. */
  public construireSnapshot(
    derniersResultats: readonly ResultatExecutionRetryNotification[],
    observations: readonly NotificationMonitoringIntegrationRecord[],
  ): NotificationRetryMonitoringSnapshot {
    const observationsRetry = observations.filter((observation) => observation.source === 'RETRY');
    const totalRetriesEnEchec =
      derniersResultats.filter((resultat) => !resultat.succes).length +
      observationsRetry.filter((observation) => observation.niveau === 'ERROR').length;

    return {
      derniersResultats: [...derniersResultats],
      totalRetries: derniersResultats.length,
      totalRetriesEnEchec,
    };
  }
}
