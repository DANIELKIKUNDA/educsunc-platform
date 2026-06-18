import { CanalNotification } from '../../domain';
import {
  ChargeLivraisonNotification,
  ProviderNotificationTechnique,
  RapportSanteProviderNotification,
  ResultatLivraisonProviderNotification,
} from './TypesProvidersNotification';

// Ce fichier prepare le provider technique futur WhatsApp du moteur Notifications.

/** Cette classe sert de placeholder technique pour le futur canal WhatsApp. */
export class ProviderNotificationWhatsAppFutur implements ProviderNotificationTechnique {
  /** Cette methode expose le nom technique du provider. */
  public obtenirNom(): string {
    return 'provider-notification-whatsapp-futur';
  }

  /** Cette methode expose le canal pris en charge par ce provider. */
  public obtenirCanal(): CanalNotification {
    return 'WHATSAPP';
  }

  /** Cette methode signale que le canal WhatsApp n'est pas encore active. */
  public async envoyer(_charge: ChargeLivraisonNotification): Promise<ResultatLivraisonProviderNotification> {
    return {
      succes: false,
      canal: 'WHATSAPP',
      fournisseur: this.obtenirNom(),
      horodatage: new Date(),
      erreur: 'Le provider WhatsApp futur n est pas encore active.',
      metadata: {},
    };
  }

  /** Cette methode retourne l'etat de sante instantane du provider futur. */
  public async verifierSante(): Promise<RapportSanteProviderNotification> {
    return {
      fournisseur: this.obtenirNom(),
      canal: 'WHATSAPP',
      etat: 'DEGRADE',
      verifieLe: new Date(),
      details: {
        mode: 'futur',
      },
    };
  }
}
