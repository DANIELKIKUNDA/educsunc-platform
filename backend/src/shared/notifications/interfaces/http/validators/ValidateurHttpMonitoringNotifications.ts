import type { RequeteMonitoringNotifications } from '../../../application';

// Ce fichier declare le validateur HTTP de monitoring Notifications.

/** Cette classe valide la forme HTTP d'une requete de monitoring. */
export class ValidateurHttpMonitoringNotifications {
  /** Cette methode valide puis convertit la query HTTP en requete applicative de monitoring. */
  public static valider(query: unknown): RequeteMonitoringNotifications {
    const objet = (query ?? {}) as Readonly<Record<string, unknown>>;
    return {
      organisationId: typeof objet.organisationId === 'string' ? objet.organisationId : undefined,
      ecoleId: typeof objet.ecoleId === 'string' ? objet.ecoleId : undefined,
      criticite: typeof objet.criticite === 'string'
        ? (objet.criticite as RequeteMonitoringNotifications['criticite'])
        : undefined,
      inclureDeadLetter: objet.inclureDeadLetter === 'true' || objet.inclureDeadLetter === true,
      inclureQueues: objet.inclureQueues === 'true' || objet.inclureQueues === true,
      inclureFournisseurs: objet.inclureFournisseurs === 'true' || objet.inclureFournisseurs === true,
    };
  }
}
