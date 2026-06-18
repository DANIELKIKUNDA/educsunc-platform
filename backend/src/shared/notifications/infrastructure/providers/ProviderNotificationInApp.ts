import { randomUUID } from 'node:crypto';
import { CanalNotification } from '../../domain';
import {
  ChargeLivraisonNotification,
  ProviderNotificationTechnique,
  RapportSanteProviderNotification,
  ResultatLivraisonProviderNotification,
} from './TypesProvidersNotification';

// Ce fichier implemente le provider technique In-App du moteur Notifications.

/** Cette classe simule la livraison technique des notifications in-app. */
export class ProviderNotificationInApp implements ProviderNotificationTechnique {
  /** Cette methode expose le nom technique du provider. */
  public obtenirNom(): string {
    return 'provider-notification-in-app';
  }

  /** Cette methode expose le canal pris en charge par ce provider. */
  public obtenirCanal(): CanalNotification {
    return 'IN_APP';
  }

  /** Cette methode effectue une livraison technique in-app. */
  public async envoyer(charge: ChargeLivraisonNotification): Promise<ResultatLivraisonProviderNotification> {
    return {
      succes: true,
      canal: 'IN_APP',
      fournisseur: this.obtenirNom(),
      identifiantLivraison: randomUUID(),
      horodatage: new Date(),
      metadata: {
        destinataire: charge.destinataire,
        notificationId: charge.identifiantNotification,
      },
    };
  }

  /** Cette methode retourne l'etat de sante instantane du provider. */
  public async verifierSante(): Promise<RapportSanteProviderNotification> {
    return {
      fournisseur: this.obtenirNom(),
      canal: 'IN_APP',
      etat: 'SAIN',
      verifieLe: new Date(),
      details: {},
    };
  }
}
