import type { RequeteDeadLettersNotifications } from '../../../application';
import { lireEntierPositif } from './ValidateurHttpSupportNotifications';

// Ce fichier declare le validateur HTTP de lecture des dead letters Notifications.

/** Cette classe valide la forme HTTP d'une requete de dead letters. */
export class ValidateurHttpDeadLetterNotifications {
  /** Cette methode valide puis convertit la query HTTP en requete applicative de dead letters. */
  public static valider(query: unknown): RequeteDeadLettersNotifications {
    const objet = (query ?? {}) as Readonly<Record<string, unknown>>;
    return {
      organisationId: typeof objet.organisationId === 'string' ? objet.organisationId : undefined,
      ecoleId: typeof objet.ecoleId === 'string' ? objet.ecoleId : undefined,
      page: lireEntierPositif(objet, 'page', 1),
      taillePage: lireEntierPositif(objet, 'taillePage', 20),
    };
  }
}
