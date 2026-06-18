import type {
  DtoDetailsNotification,
  ModeleLectureHistoriqueRetriesNotification,
} from '../../../application';

// Ce fichier declare le presentateur HTTP de retry Notifications.

/** Cette classe transforme les sorties de retry en reponses HTTP stables. */
export class PresentateurHttpRetryNotification {
  /** Cette methode presente le detail retourne apres pilotage du retry. */
  public static presenterControle(dto: DtoDetailsNotification): DtoDetailsNotification {
    return { ...dto };
  }

  /** Cette methode presente l'historique de retry d'une notification. */
  public static presenterHistorique(modele: ModeleLectureHistoriqueRetriesNotification): {
    readonly identifiantNotification: string;
    readonly retries: readonly {
      readonly compteur: number;
      readonly raison?: string;
      readonly horodatage: string;
      readonly initiateur?: string;
    }[];
  } {
    return {
      identifiantNotification: modele.identifiantNotification,
      retries: modele.retries.map((retry) => ({
        ...retry,
        horodatage: retry.horodatage.toISOString(),
      })),
    };
  }
}
