import type { RequeteListerNotifications } from '../../../application';
import { lireDate, lireEntierPositif } from './ValidateurHttpSupportNotifications';

// Ce fichier declare le validateur HTTP de liste de notifications.

/** Cette classe valide la forme HTTP d'une requete de liste. */
export class ValidateurHttpListeNotifications {
  /** Cette methode valide puis convertit la query HTTP en requete applicative. */
  public static valider(query: unknown): RequeteListerNotifications {
    const objet = (query ?? {}) as Readonly<Record<string, unknown>>;
    return {
      organisationId: typeof objet.organisationId === 'string' ? objet.organisationId : undefined,
      ecoleId: typeof objet.ecoleId === 'string' ? objet.ecoleId : undefined,
      destinataireId: typeof objet.destinataireId === 'string' ? objet.destinataireId : undefined,
      statut: typeof objet.statut === 'string' ? objet.statut : undefined,
      type: typeof objet.type === 'string' ? objet.type : undefined,
      canal: typeof objet.canal === 'string' ? objet.canal : undefined,
      page: lireEntierPositif(objet, 'page', 1),
      taillePage: lireEntierPositif(objet, 'taillePage', 20),
      dateDebut: lireDate(objet, 'dateDebut'),
      dateFin: lireDate(objet, 'dateFin'),
    };
  }
}
