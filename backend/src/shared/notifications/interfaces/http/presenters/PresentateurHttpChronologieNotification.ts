import type { ModeleLectureChronologieNotification } from '../../../application';

// Ce fichier declare le presentateur HTTP de chronologie Notifications.

/** Cette classe transforme une chronologie projetee en sortie HTTP stable. */
export class PresentateurHttpChronologieNotification {
  /** Cette methode presente la chronologie d'une notification. */
  public static presenterChronologie(modele: ModeleLectureChronologieNotification): {
    readonly identifiantNotification: string;
    readonly elements: readonly {
      readonly identifiant: string;
      readonly typeEvenement: string;
      readonly statutAvant?: string;
      readonly statutApres: string;
      readonly horodatage: string;
      readonly correlationId?: string;
      readonly requestId?: string;
      readonly acteur?: string;
      readonly metadonnees: Readonly<Record<string, unknown>>;
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
}
