import { CanalNotification } from '../../domain';
import {
  ChargeLivraisonNotification,
  ProviderNotificationTechnique,
  RapportSanteProviderNotification,
  ResultatLivraisonProviderNotification,
} from './TypesProvidersNotification';

// Ce fichier prepare le provider technique futur Webhook du moteur Notifications.

/** Cette classe sert de placeholder technique pour le futur canal Webhook. */
export class ProviderNotificationWebhookFutur implements ProviderNotificationTechnique {
  /** Cette methode expose le nom technique du provider. */
  public obtenirNom(): string {
    return 'provider-notification-webhook-futur';
  }

  /** Cette methode expose le canal pris en charge par ce provider. */
  public obtenirCanal(): CanalNotification {
    return 'WEBHOOK';
  }

  /** Cette methode signale que le canal Webhook n'est pas encore active. */
  public async envoyer(_charge: ChargeLivraisonNotification): Promise<ResultatLivraisonProviderNotification> {
    return {
      succes: false,
      canal: 'WEBHOOK',
      fournisseur: this.obtenirNom(),
      horodatage: new Date(),
      erreur: 'Le provider Webhook futur n est pas encore active.',
      metadata: {},
    };
  }

  /** Cette methode retourne l'etat de sante instantane du provider futur. */
  public async verifierSante(): Promise<RapportSanteProviderNotification> {
    return {
      fournisseur: this.obtenirNom(),
      canal: 'WEBHOOK',
      etat: 'DEGRADE',
      verifieLe: new Date(),
      details: {
        mode: 'futur',
      },
    };
  }
}
