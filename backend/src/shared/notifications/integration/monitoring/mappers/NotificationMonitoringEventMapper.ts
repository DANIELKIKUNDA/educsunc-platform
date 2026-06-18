import type { NotificationContext } from '../../../context';
import type {
  NotificationMonitoringIntegrationRecord,
  NotificationMonitoringIntegrationSource,
  NotificationMonitoringObservation,
} from '../NotificationsMonitoringIntegrationTypes';

// Ce fichier traduit les observations Notifications vers le format stable du monitoring transverse.

/** Cette classe transforme un contexte Notifications en observation puis en enregistrement partageable. */
export class NotificationMonitoringEventMapper {
  /** Cette methode construit une observation standard a partir d'un contexte Notifications. */
  public static versObservation(params: {
    readonly source: NotificationMonitoringIntegrationSource;
    readonly niveau?: NotificationMonitoringObservation['niveau'];
    readonly message: string;
    readonly notificationContext: NotificationContext;
    readonly donnees?: Readonly<Record<string, unknown>>;
  }): NotificationMonitoringObservation {
    return {
      source: params.source,
      niveau: params.niveau ?? 'INFO',
      message: params.message,
      notificationContext: { ...params.notificationContext },
      donnees: { ...(params.donnees ?? {}) },
      observeLe: new Date(),
    };
  }

  /** Cette methode projette une observation standard dans un enregistrement persistant pour le monitoring. */
  public static versEnregistrement(
    observation: NotificationMonitoringObservation,
  ): NotificationMonitoringIntegrationRecord {
    return {
      source: observation.source,
      niveau: observation.niveau,
      message: observation.message,
      notificationId: observation.notificationContext.notificationId,
      canal: observation.notificationContext.canal,
      correlationId: observation.notificationContext.correlationId,
      requestId: observation.notificationContext.requestId,
      queueName: observation.notificationContext.queueName,
      workerId: observation.notificationContext.workerId,
      replayId: observation.notificationContext.replayId,
      retryCount: observation.notificationContext.retryCount,
      organisationId: observation.notificationContext.organisationId,
      ecoleId: observation.notificationContext.ecoleId,
      provider: observation.notificationContext.provider,
      donnees: { ...observation.donnees },
      observeLe: observation.observeLe.toISOString(),
    };
  }
}
