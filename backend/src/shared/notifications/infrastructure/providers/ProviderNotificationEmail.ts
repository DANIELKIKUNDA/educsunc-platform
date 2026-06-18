import { randomUUID } from 'node:crypto';
import { CanalNotification } from '../../domain';
import {
  ChargeLivraisonNotification,
  ProviderNotificationTechnique,
  RapportSanteProviderNotification,
  ResultatLivraisonProviderNotification,
} from './TypesProvidersNotification';

// Ce fichier implemente le provider technique Email du moteur Notifications.

/** Cette classe simule la livraison technique des notifications email. */
export class ProviderNotificationEmail implements ProviderNotificationTechnique {
  /** Cette methode expose le nom technique du provider. */
  public obtenirNom(): string {
    return 'provider-notification-email';
  }

  /** Cette methode expose le canal pris en charge par ce provider. */
  public obtenirCanal(): CanalNotification {
    return 'EMAIL';
  }

  /** Cette methode effectue une livraison technique email avec sujet optionnel. */
  public async envoyer(charge: ChargeLivraisonNotification): Promise<ResultatLivraisonProviderNotification> {
    return {
      succes: true,
      canal: 'EMAIL',
      fournisseur: this.obtenirNom(),
      identifiantLivraison: randomUUID(),
      horodatage: new Date(),
      metadata: {
        destinataire: charge.destinataire,
        sujet: charge.sujet,
      },
    };
  }

  /** Cette methode retourne l'etat de sante instantane du provider email. */
  public async verifierSante(): Promise<RapportSanteProviderNotification> {
    return {
      fournisseur: this.obtenirNom(),
      canal: 'EMAIL',
      etat: 'SAIN',
      verifieLe: new Date(),
      details: {
        supportHtml: false,
      },
    };
  }
}
