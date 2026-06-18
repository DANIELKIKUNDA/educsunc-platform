import type { CommandeAccuserReceptionNotification } from '../../../application';
import { exigerChaine, exigerObjet, lireDate } from './ValidateurHttpSupportNotifications';

// Ce fichier declare le validateur HTTP d'accuse de reception de notification.

/** Cette classe valide la forme HTTP d'un accuse de reception ou de lecture. */
export class ValidateurHttpAccuseReceptionNotification {
  /** Cette methode valide puis convertit la requete HTTP en commande applicative d'accuse. */
  public static valider(
    params: { id?: string } | undefined,
    body: unknown,
  ): CommandeAccuserReceptionNotification {
    const objet = exigerObjet(body, 'Le body d accuse de reception est obligatoire.');
    return {
      identifiantNotification: params?.id ?? exigerChaine(objet, 'identifiantNotification'),
      destinataireId: exigerChaine(objet, 'destinataireId'),
      acteurId: typeof objet.acteurId === 'string' ? objet.acteurId : undefined,
      correlationId: typeof objet.correlationId === 'string' ? objet.correlationId : undefined,
      requestId: typeof objet.requestId === 'string' ? objet.requestId : undefined,
      marquerCommeLue: objet.marquerCommeLue === true,
      dateAccusee: lireDate(objet, 'dateAccusee'),
    };
  }
}
