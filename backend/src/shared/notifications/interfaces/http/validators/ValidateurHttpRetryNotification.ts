import type { CommandeControlerRetryNotification } from '../../../application';
import { exigerChaine, exigerObjet } from './ValidateurHttpSupportNotifications';

// Ce fichier declare le validateur HTTP de retry de notification.

/** Cette classe valide la forme HTTP du pilotage de retry. */
export class ValidateurHttpRetryNotification {
  /** Cette methode valide puis convertit la requete HTTP en commande applicative de retry. */
  public static valider(
    params: { id?: string } | undefined,
    body: unknown,
  ): CommandeControlerRetryNotification {
    const objet = exigerObjet(body, 'Le body de retry de notification est obligatoire.');
    return {
      identifiantNotification: params?.id ?? exigerChaine(objet, 'identifiantNotification'),
      raison: exigerChaine(objet, 'raison'),
      action: String(objet.action) as CommandeControlerRetryNotification['action'],
      acteurId: typeof objet.acteurId === 'string' ? objet.acteurId : undefined,
      correlationId: typeof objet.correlationId === 'string' ? objet.correlationId : undefined,
      requestId: typeof objet.requestId === 'string' ? objet.requestId : undefined,
    };
  }
}
