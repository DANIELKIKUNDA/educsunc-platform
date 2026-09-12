import { CanalNotification } from '../../domain';
import { ChargeLivraisonNotification, ProviderNotificationTechnique, RapportSanteProviderNotification, ResultatLivraisonProviderNotification } from './TypesProvidersNotification';

/** IN_APP ne simule aucun transport externe : la notification durable elle-meme est la livraison. */
export class ProviderNotificationInApp implements ProviderNotificationTechnique {
  public obtenirNom(): string { return 'provider-notification-in-app'; }
  public obtenirCanal(): CanalNotification { return 'IN_APP'; }
  public async envoyer(charge: ChargeLivraisonNotification): Promise<ResultatLivraisonProviderNotification> {
    if (!charge.identifiantNotification) return { succes: false, canal: 'IN_APP', fournisseur: this.obtenirNom(), horodatage: new Date(), erreur: 'Identifiant de notification durable absent.', metadata: {} };
    return { succes: true, canal: 'IN_APP', fournisseur: this.obtenirNom(), identifiantLivraison: charge.identifiantNotification, horodatage: new Date(), metadata: { notificationId: charge.identifiantNotification, persistanceRequise: true } };
  }
  public async verifierSante(): Promise<RapportSanteProviderNotification> { return { fournisseur: this.obtenirNom(), canal: 'IN_APP', etat: 'SAIN', verifieLe: new Date(), details: { transportExterne: false, persistanceRequise: true } }; }
}
