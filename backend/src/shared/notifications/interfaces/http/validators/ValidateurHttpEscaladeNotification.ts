import type { CommandeEscaladerNotification } from '../../../application';
import { exigerChaine, exigerObjet } from './ValidateurHttpSupportNotifications';

// Ce fichier declare le validateur HTTP d'escalade de notification.

/** Cette classe valide la forme HTTP d'une demande d'escalade. */
export class ValidateurHttpEscaladeNotification {
  /** Cette methode valide puis convertit la requete HTTP en commande applicative d'escalade. */
  public static valider(
    params: { id?: string } | undefined,
    body: unknown,
  ): CommandeEscaladerNotification {
    const objet = exigerObjet(body, 'Le body d escalade de notification est obligatoire.');
    return {
      identifiantNotification: params?.id ?? exigerChaine(objet, 'identifiantNotification'),
      raison: exigerChaine(objet, 'raison'),
      organisationId: typeof objet.organisationId === 'string' ? objet.organisationId : undefined,
      ecoleId: typeof objet.ecoleId === 'string' ? objet.ecoleId : undefined,
      acteurId: typeof objet.acteurId === 'string' ? objet.acteurId : undefined,
      correlationId: typeof objet.correlationId === 'string' ? objet.correlationId : undefined,
      requestId: typeof objet.requestId === 'string' ? objet.requestId : undefined,
      nouveauxDestinataires:
        Array.isArray(objet.nouveauxDestinataires)
          ? (objet.nouveauxDestinataires as CommandeEscaladerNotification['nouveauxDestinataires'])
          : undefined,
      canauxSupplementaires:
        Array.isArray(objet.canauxSupplementaires)
          ? (objet.canauxSupplementaires as CommandeEscaladerNotification['canauxSupplementaires'])
          : undefined,
    };
  }
}
