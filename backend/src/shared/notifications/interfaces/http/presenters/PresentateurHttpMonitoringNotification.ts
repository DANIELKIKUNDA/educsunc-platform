import type {
  ModeleLectureDeadLettersNotifications,
  ModeleLectureMonitoringNotifications,
} from '../../../application';

// Ce fichier declare le presentateur HTTP de monitoring Notifications.

/** Cette classe transforme les vues de monitoring et dead letters en sorties HTTP stables. */
export class PresentateurHttpMonitoringNotification {
  /** Cette methode presente la vue de monitoring agregée du module Notifications. */
  public static presenterMonitoring(modele: ModeleLectureMonitoringNotifications): {
    readonly total: number;
    readonly enEchec: number;
    readonly enRetry: number;
    readonly enDeadLetter: number;
    readonly fournisseursDegrades: readonly string[];
    readonly saturationQueues: readonly string[];
    readonly dateObservation: string;
  } {
    return {
      total: modele.totalNotifications,
      enEchec: modele.totalEnEchec,
      enRetry: modele.totalEnRetry,
      enDeadLetter: modele.totalDeadLetters,
      fournisseursDegrades: modele.fournisseursDegrades,
      saturationQueues: modele.queuesSaturees,
      dateObservation: modele.dateObservation.toISOString(),
    };
  }

  /** Cette methode presente les dead letters du module Notifications. */
  public static presenterDeadLetters(modele: ModeleLectureDeadLettersNotifications): {
    readonly elements: readonly {
      readonly identifiantNotification: string;
      readonly raison: string;
      readonly dateEntree: string;
      readonly correlationId?: string;
      readonly requestId?: string;
      readonly organisationId?: string;
      readonly ecoleId?: string;
    }[];
    readonly page: number;
    readonly taillePage: number;
    readonly total: number;
  } {
    return {
      elements: modele.elements.map((element) => ({
        ...element,
        dateEntree: element.dateEntree.toISOString(),
      })),
      page: modele.page,
      taillePage: modele.taillePage,
      total: modele.total,
    };
  }
}
