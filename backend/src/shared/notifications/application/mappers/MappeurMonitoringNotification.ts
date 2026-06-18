import { DtoMonitoringNotification } from '../dto';
import { ModeleLectureMonitoringNotifications } from '../read-models';

// Ce fichier transforme la projection de monitoring en DTO de sortie.

/** Cette classe convertit la vue de monitoring en DTO stable. */
export class MappeurMonitoringNotification {
  /** Cette methode convertit une projection de monitoring en DTO. */
  public static versDto(modele: ModeleLectureMonitoringNotifications): DtoMonitoringNotification {
    return {
      total: modele.totalNotifications,
      enEchec: modele.totalEnEchec,
      enRetry: modele.totalEnRetry,
      enDeadLetter: modele.totalDeadLetters,
      fournisseursDegrades: modele.fournisseursDegrades,
      saturationQueues: modele.queuesSaturees,
    };
  }
}
