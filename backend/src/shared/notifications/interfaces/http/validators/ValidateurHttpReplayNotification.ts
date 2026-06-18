import type { CommandeRejouerNotification } from '../../../application';
import { exigerChaine, exigerObjet } from './ValidateurHttpSupportNotifications';

// Ce fichier declare le validateur HTTP de rejeu de notification.

/** Cette classe valide la forme HTTP d'une demande de rejeu. */
export class ValidateurHttpReplayNotification {
  /** Cette methode valide puis convertit la requete HTTP en commande applicative de rejeu. */
  public static valider(
    params: { id?: string } | undefined,
    body: unknown,
  ): CommandeRejouerNotification {
    const objet = exigerObjet(body, 'Le body de rejeu de notification est obligatoire.');
    return {
      identifiantNotification: params?.id ?? exigerChaine(objet, 'identifiantNotification'),
      raison: exigerChaine(objet, 'raison'),
      organisationId: typeof objet.organisationId === 'string' ? objet.organisationId : undefined,
      ecoleId: typeof objet.ecoleId === 'string' ? objet.ecoleId : undefined,
      acteurId: typeof objet.acteurId === 'string' ? objet.acteurId : undefined,
      correlationId: typeof objet.correlationId === 'string' ? objet.correlationId : undefined,
      requestId: typeof objet.requestId === 'string' ? objet.requestId : undefined,
      autoriserRenduCanal: objet.autoriserRenduCanal === true,
      rebatirChronologie: objet.rebatirChronologie !== false,
    };
  }
}
