import { CanalNotification } from '../../domain';
import {
  ChargeLivraisonNotification,
  ProviderNotificationTechnique,
  RapportSanteProviderNotification,
  ResultatLivraisonProviderNotification,
} from './TypesProvidersNotification';

// Ce fichier prepare le provider technique futur Push du moteur Notifications.

/** Cette classe sert de placeholder technique pour le futur canal Push. */
export class ProviderNotificationPushFutur implements ProviderNotificationTechnique {
  /** Cette methode expose le nom technique du provider. */
  public obtenirNom(): string {
    return 'provider-notification-push-futur';
  }

  /** Cette methode expose le canal pris en charge par ce provider. */
  public obtenirCanal(): CanalNotification {
    return 'PUSH';
  }

  /** Cette methode signale que le canal Push n'est pas encore active. */
  public async envoyer(_charge: ChargeLivraisonNotification): Promise<ResultatLivraisonProviderNotification> {
    return {
      succes: false,
      canal: 'PUSH',
      fournisseur: this.obtenirNom(),
      horodatage: new Date(),
      erreur: 'Le provider Push futur n est pas encore active.',
      metadata: {},
    };
  }

  /** Cette methode retourne l'etat de sante instantane du provider futur. */
  public async verifierSante(): Promise<RapportSanteProviderNotification> {
    return {
      fournisseur: this.obtenirNom(),
      canal: 'PUSH',
      etat: 'DEGRADE',
      verifieLe: new Date(),
      details: {
        mode: 'futur',
      },
    };
  }
}
