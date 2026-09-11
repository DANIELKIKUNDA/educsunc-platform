import { CanalNotification } from '../../domain';
import type { PortTransportSms } from './PortsTransportNotification';
import { ChargeLivraisonNotification, ProviderNotificationTechnique, RapportSanteProviderNotification, ResultatLivraisonProviderNotification } from './TypesProvidersNotification';

export class ProviderNotificationSms implements ProviderNotificationTechnique {
  constructor(private readonly transport?: PortTransportSms) {}
  public obtenirNom(): string { return 'provider-notification-sms'; }
  public obtenirCanal(): CanalNotification { return 'SMS'; }
  public async envoyer(charge: ChargeLivraisonNotification): Promise<ResultatLivraisonProviderNotification> {
    if (charge.message.length > 480) return { succes: false, canal: 'SMS', fournisseur: this.obtenirNom(), horodatage: new Date(), erreur: 'Le message SMS depasse la limite technique configuree.', metadata: { longueurMessage: charge.message.length } };
    if (!this.transport) return this.indisponible('Aucun agregateur SMS reel n est configure.');
    try { const resultat = await this.transport.envoyer(charge); return { succes: true, canal: 'SMS', fournisseur: this.obtenirNom(), identifiantLivraison: resultat.identifiantLivraison, horodatage: new Date(), metadata: { longueurMessage: charge.message.length, ...(resultat.metadata ?? {}) } }; }
    catch { return this.indisponible('L agregateur SMS a refuse ou interrompu la livraison.'); }
  }
  public async verifierSante(): Promise<RapportSanteProviderNotification> {
    const disponible = this.transport ? (await this.transport.verifierDisponibilite?.().catch(() => false) ?? true) : false;
    return { fournisseur: this.obtenirNom(), canal: 'SMS', etat: disponible ? 'SAIN' : 'INDISPONIBLE', verifieLe: new Date(), details: { configure: Boolean(this.transport), limiteLongueur: 480 } };
  }
  private indisponible(erreur: string): ResultatLivraisonProviderNotification { return { succes: false, canal: 'SMS', fournisseur: this.obtenirNom(), horodatage: new Date(), erreur, metadata: { configure: Boolean(this.transport) } }; }
}
