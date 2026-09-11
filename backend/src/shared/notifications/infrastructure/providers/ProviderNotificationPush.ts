import { CanalNotification } from '../../domain';
import type { PortTransportPush } from './PortsTransportNotification';
import { ChargeLivraisonNotification, ProviderNotificationTechnique, RapportSanteProviderNotification, ResultatLivraisonProviderNotification } from './TypesProvidersNotification';

/** Provider Push vendor-neutral. Le transport (Web Push/FCM/APNs) est injecte par l'infrastructure de deploiement. */
export class ProviderNotificationPush implements ProviderNotificationTechnique {
  constructor(private readonly transport?: PortTransportPush) {}
  public obtenirNom(): string { return 'provider-notification-push'; }
  public obtenirCanal(): CanalNotification { return 'PUSH'; }
  public async envoyer(charge: ChargeLivraisonNotification): Promise<ResultatLivraisonProviderNotification> {
    if (!this.transport) return { succes: false, canal: 'PUSH', fournisseur: this.obtenirNom(), horodatage: new Date(), erreur: 'Aucun transport Push reel n est configure.', metadata: { configure: false } };
    try { const resultat = await this.transport.envoyer(charge); return { succes: true, canal: 'PUSH', fournisseur: this.obtenirNom(), identifiantLivraison: resultat.identifiantLivraison, horodatage: new Date(), metadata: { ...(resultat.metadata ?? {}) } }; }
    catch { return { succes: false, canal: 'PUSH', fournisseur: this.obtenirNom(), horodatage: new Date(), erreur: 'Le transport Push a refuse ou interrompu la livraison.', metadata: { configure: true } }; }
  }
  public async verifierSante(): Promise<RapportSanteProviderNotification> {
    const disponible = this.transport ? (await this.transport.verifierDisponibilite?.().catch(() => false) ?? true) : false;
    return { fournisseur: this.obtenirNom(), canal: 'PUSH', etat: disponible ? 'SAIN' : 'INDISPONIBLE', verifieLe: new Date(), details: { configure: Boolean(this.transport), transportsSupportes: ['WEB_PUSH', 'FCM', 'APNS'] } };
  }
}
