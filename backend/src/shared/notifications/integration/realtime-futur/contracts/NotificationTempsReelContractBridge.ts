import type { NotificationTempsReelCapabilitiesSnapshot } from '../NotificationsTempsReelIntegrationTypes';

// Ce fichier expose une vue de contrats/capacites du pont temps reel Notifications.

/** Cette classe construit la vue declarative du futur contrat temps reel de Notifications. */
export class NotificationTempsReelContractBridge {
  /** Cette methode retourne les capacites temps reel actuellement declarees par le pont. */
  public construireCapacites(params: {
    readonly publicationActive: boolean;
    readonly sseDisponible: boolean;
    readonly webSocketDisponible: boolean;
    readonly totalPublications: number;
  }): NotificationTempsReelCapabilitiesSnapshot {
    return {
      publicationActive: params.publicationActive,
      sseDisponible: params.sseDisponible,
      webSocketDisponible: params.webSocketDisponible,
      totalPublications: params.totalPublications,
    };
  }
}
