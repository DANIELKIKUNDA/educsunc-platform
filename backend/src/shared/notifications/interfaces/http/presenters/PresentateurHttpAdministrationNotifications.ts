import type {
  ModeleLectureArchivesNotifications,
  ModeleLectureTenantNotifications,
  ModeleLectureTraceEscaladeNotification,
} from '../../../application';

// Ce fichier declare le presentateur HTTP d'administration Notifications.

/** Cette classe transforme les vues admin et temps reel en sorties HTTP stables. */
export class PresentateurHttpAdministrationNotifications {
  /** Cette methode presente les archives Notifications. */
  public static presenterArchives(modele: ModeleLectureArchivesNotifications): {
    readonly elements: readonly {
      readonly identifiantNotification: string;
      readonly type: string;
      readonly dateArchivage: string;
      readonly raisonArchivage?: string;
    }[];
    readonly page: number;
    readonly taillePage: number;
    readonly total: number;
  } {
    return {
      elements: modele.elements.map((element) => ({
        ...element,
        dateArchivage: element.dateArchivage.toISOString(),
      })),
      page: modele.page,
      taillePage: modele.taillePage,
      total: modele.total,
    };
  }

  /** Cette methode presente la vue consolidee tenant-aware du module Notifications. */
  public static presenterTenant(modele: ModeleLectureTenantNotifications): ModeleLectureTenantNotifications {
    return { ...modele };
  }

  /** Cette methode presente la trace d'escalade d'une notification. */
  public static presenterTraceEscalade(modele: ModeleLectureTraceEscaladeNotification): {
    readonly identifiantNotification: string;
    readonly elements: readonly {
      readonly identifiant: string;
      readonly raison: string;
      readonly acteur?: string;
      readonly horodatage: string;
      readonly audienceCible: readonly string[];
    }[];
  } {
    return {
      identifiantNotification: modele.identifiantNotification,
      elements: modele.elements.map((element) => ({
        ...element,
        horodatage: element.horodatage.toISOString(),
      })),
    };
  }

  /** Cette methode presente les capacites actuellement annoncees pour le futur temps reel. */
  public static presenterCapacitesTempsReel(): {
    readonly disponible: boolean;
    readonly canaux: readonly string[];
    readonly mode: 'PREPARATOIRE';
  } {
    return {
      disponible: true,
      canaux: ['SSE_FUTUR', 'WEBSOCKET_FUTUR'],
      mode: 'PREPARATOIRE',
    };
  }

  /** Cette methode presente l'accuse de publication de test temps reel. */
  public static presenterPublicationTempsReel(sujet: string): {
    readonly accepte: true;
    readonly sujet: string;
  } {
    return {
      accepte: true,
      sujet,
    };
  }
}
