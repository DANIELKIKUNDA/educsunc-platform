import type { ResultatExecutionReplayNotification } from '../../../infrastructure/replay';
import type {
  NotificationMonitoringIntegrationRecord,
  NotificationReplayMonitoringSnapshot,
} from '../NotificationsMonitoringIntegrationTypes';

// Ce fichier consolide les rejeux Notifications pour le monitoring transverse.

/** Cette classe traduit les resultats de rejeu en vue de supervision partageable. */
export class NotificationReplayMonitoringBridge {
  /** Cette methode construit la vue monitoring des rejeux a partir des derniers resultats et observations. */
  public construireSnapshot(
    derniersResultats: readonly ResultatExecutionReplayNotification[],
    observations: readonly NotificationMonitoringIntegrationRecord[],
  ): NotificationReplayMonitoringSnapshot {
    const observationsReplay = observations.filter((observation) => observation.source === 'REPLAY');
    const totalRejeuxEnEchec =
      derniersResultats.filter((resultat) => !resultat.succes).length +
      observationsReplay.filter((observation) => observation.niveau === 'ERROR').length;

    return {
      derniersResultats: [...derniersResultats],
      totalRejeux: derniersResultats.length,
      totalRejeuxEnEchec,
    };
  }
}
