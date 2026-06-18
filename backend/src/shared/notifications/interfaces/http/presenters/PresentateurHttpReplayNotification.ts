import type {
  DtoDetailsNotification,
  ModeleLectureDiagnosticReplayNotification,
} from '../../../application';

// Ce fichier declare le presentateur HTTP de replay Notifications.

/** Cette classe transforme les sorties de replay en reponses HTTP stables. */
export class PresentateurHttpReplayNotification {
  /** Cette methode presente le detail retourne apres un rejeu. */
  public static presenterRejeu(dto: DtoDetailsNotification): DtoDetailsNotification {
    return { ...dto };
  }

  /** Cette methode presente le diagnostic de rejeu d'une notification. */
  public static presenterDiagnostic(modele: ModeleLectureDiagnosticReplayNotification): {
    readonly identifiantNotification: string;
    readonly totalReplays: number;
    readonly dernierReplayLe?: string;
    readonly dernierReplayPar?: string;
    readonly rebatirChronologie: boolean;
    readonly autoriserRenduCanal: boolean;
  } {
    return {
      identifiantNotification: modele.identifiantNotification,
      totalReplays: modele.totalReplays,
      dernierReplayLe: modele.dernierReplayLe?.toISOString(),
      dernierReplayPar: modele.dernierReplayPar,
      rebatirChronologie: modele.rebatirChronologie,
      autoriserRenduCanal: modele.autoriserRenduCanal,
    };
  }
}
