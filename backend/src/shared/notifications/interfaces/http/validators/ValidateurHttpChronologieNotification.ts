import type { RequeteChronologieNotification } from '../../../application';

// Ce fichier declare le validateur HTTP de chronologie de notification.

/** Cette classe valide la forme HTTP d'une requete de chronologie. */
export class ValidateurHttpChronologieNotification {
  /** Cette methode valide puis convertit params et query en requete applicative. */
  public static valider(
    params: { id?: string } | undefined,
    query: unknown,
  ): RequeteChronologieNotification {
    const objet = (query ?? {}) as Readonly<Record<string, unknown>>;
    const identifiantNotification = params?.id ?? (typeof objet.identifiantNotification === 'string' ? objet.identifiantNotification : undefined);
    if (!identifiantNotification) {
      throw new Error('L identifiant de notification est obligatoire pour lire la chronologie.');
    }

    return {
      identifiantNotification,
      organisationId: typeof objet.organisationId === 'string' ? objet.organisationId : undefined,
      ecoleId: typeof objet.ecoleId === 'string' ? objet.ecoleId : undefined,
      granularite: typeof objet.granularite === 'string'
        ? (objet.granularite as RequeteChronologieNotification['granularite'])
        : undefined,
    };
  }
}
