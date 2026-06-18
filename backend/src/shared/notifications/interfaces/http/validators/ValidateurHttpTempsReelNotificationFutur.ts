import { exigerChaine, exigerObjet } from './ValidateurHttpSupportNotifications';

// Ce fichier declare le validateur HTTP du futur temps reel Notifications.

/** Cette interface represente la charge HTTP d'un test de diffusion temps reel. */
export interface EntreeHttpTempsReelNotificationFutur {
  readonly sujet: string;
  readonly donnees: Readonly<Record<string, unknown>>;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly acteurId?: string;
  readonly correlationId?: string;
  readonly requestId?: string;
}

/** Cette classe valide la forme HTTP des contrats futurs de temps reel. */
export class ValidateurHttpTempsReelNotificationFutur {
  /** Cette methode valide puis convertit le body HTTP en charge de publication future. */
  public static valider(body: unknown): EntreeHttpTempsReelNotificationFutur {
    const objet = exigerObjet(body, 'Le body temps reel futur est obligatoire.');
    const donnees = typeof objet.donnees === 'object' && objet.donnees !== null
      ? (objet.donnees as Readonly<Record<string, unknown>>)
      : {};

    return {
      sujet: exigerChaine(objet, 'sujet'),
      donnees,
      organisationId: typeof objet.organisationId === 'string' ? objet.organisationId : undefined,
      ecoleId: typeof objet.ecoleId === 'string' ? objet.ecoleId : undefined,
      acteurId: typeof objet.acteurId === 'string' ? objet.acteurId : undefined,
      correlationId: typeof objet.correlationId === 'string' ? objet.correlationId : undefined,
      requestId: typeof objet.requestId === 'string' ? objet.requestId : undefined,
    };
  }
}
