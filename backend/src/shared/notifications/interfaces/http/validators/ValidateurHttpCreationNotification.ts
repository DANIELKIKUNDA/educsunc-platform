import type { CommandeCreerNotification } from '../../../application';
import {
  exigerObjet,
  lireDate,
} from './ValidateurHttpSupportNotifications';

// Ce fichier declare le validateur HTTP de creation de notification.

/** Cette classe valide la forme HTTP d'une creation de notification. */
export class ValidateurHttpCreationNotification {
  /** Cette methode valide puis convertit le body HTTP en commande applicative. */
  public static valider(body: unknown): CommandeCreerNotification {
    const objet = exigerObjet(body, 'Le body de creation de notification est obligatoire.');
    if (!Array.isArray(objet.destinataires) || objet.destinataires.length === 0) {
      throw new Error('La creation de notification exige au moins un destinataire.');
    }
    if (!Array.isArray(objet.canaux) || objet.canaux.length === 0) {
      throw new Error('La creation de notification exige au moins un canal.');
    }

    return {
      ...objet,
      type: String(objet.type) as CommandeCreerNotification['type'],
      priorite: String(objet.priorite) as CommandeCreerNotification['priorite'],
      portee: String(objet.portee) as CommandeCreerNotification['portee'],
      temporalite: String(objet.temporalite) as CommandeCreerNotification['temporalite'],
      visibilite: String(objet.visibilite) as CommandeCreerNotification['visibilite'],
      source: String(objet.source) as CommandeCreerNotification['source'],
      strategieLivraison: String(objet.strategieLivraison) as CommandeCreerNotification['strategieLivraison'],
      canaux: [...(objet.canaux as readonly CommandeCreerNotification['canaux'][number][])],
      message: String(objet.message ?? ''),
      destinataires: [...(objet.destinataires as CommandeCreerNotification['destinataires'])],
      datePlanification: lireDate(objet, 'datePlanification'),
      dateExpiration: lireDate(objet, 'dateExpiration'),
    };
  }
}
