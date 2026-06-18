import { randomUUID } from 'node:crypto';
import { CanalNotification } from '../../domain';
import {
  ChargeLivraisonNotification,
  ProviderNotificationTechnique,
  RapportSanteProviderNotification,
  ResultatLivraisonProviderNotification,
} from './TypesProvidersNotification';

// Ce fichier implemente le provider technique SMS du moteur Notifications.

/** Cette classe simule la livraison technique des notifications SMS. */
export class ProviderNotificationSms implements ProviderNotificationTechnique {
  /** Cette methode expose le nom technique du provider. */
  public obtenirNom(): string {
    return 'provider-notification-sms';
  }

  /** Cette methode expose le canal pris en charge par ce provider. */
  public obtenirCanal(): CanalNotification {
    return 'SMS';
  }

  /** Cette methode effectue une livraison technique SMS avec un controle de longueur simple. */
  public async envoyer(charge: ChargeLivraisonNotification): Promise<ResultatLivraisonProviderNotification> {
    if (charge.message.length > 480) {
      return {
        succes: false,
        canal: 'SMS',
        fournisseur: this.obtenirNom(),
        horodatage: new Date(),
        erreur: 'Le message SMS depasse la limite technique configuree.',
        metadata: {
          longueurMessage: charge.message.length,
        },
      };
    }

    return {
      succes: true,
      canal: 'SMS',
      fournisseur: this.obtenirNom(),
      identifiantLivraison: randomUUID(),
      horodatage: new Date(),
      metadata: {
        destinataire: charge.destinataire,
        longueurMessage: charge.message.length,
      },
    };
  }

  /** Cette methode retourne l'etat de sante instantane du provider SMS. */
  public async verifierSante(): Promise<RapportSanteProviderNotification> {
    return {
      fournisseur: this.obtenirNom(),
      canal: 'SMS',
      etat: 'SAIN',
      verifieLe: new Date(),
      details: {
        limiteLongueur: 480,
      },
    };
  }
}
