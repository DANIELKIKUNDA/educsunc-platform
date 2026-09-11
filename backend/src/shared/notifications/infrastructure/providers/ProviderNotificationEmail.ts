import { CanalNotification } from '../../domain';
import type { PortTransportEmail } from './PortsTransportNotification';
import {
  ChargeLivraisonNotification, ProviderNotificationTechnique, RapportSanteProviderNotification,
  ResultatLivraisonProviderNotification,
} from './TypesProvidersNotification';

export class ProviderNotificationEmail implements ProviderNotificationTechnique {
  constructor(private readonly transport?: PortTransportEmail) {}
  public obtenirNom(): string { return 'provider-notification-email'; }
  public obtenirCanal(): CanalNotification { return 'EMAIL'; }
  public async envoyer(charge: ChargeLivraisonNotification): Promise<ResultatLivraisonProviderNotification> {
    if (!this.transport) return this.indisponible('Aucun transport Email reel n est configure.');
    try {
      const resultat = await this.transport.envoyer(charge);
      return { succes: true, canal: 'EMAIL', fournisseur: this.obtenirNom(), identifiantLivraison: resultat.identifiantLivraison, horodatage: new Date(), metadata: { ...(resultat.metadata ?? {}) } };
    } catch { return this.indisponible('Le transport Email a refuse ou interrompu la livraison.'); }
  }
  public async verifierSante(): Promise<RapportSanteProviderNotification> {
    const disponible = this.transport ? (await this.transport.verifierDisponibilite?.().catch(() => false) ?? true) : false;
    return { fournisseur: this.obtenirNom(), canal: 'EMAIL', etat: disponible ? 'SAIN' : 'INDISPONIBLE', verifieLe: new Date(), details: { configure: Boolean(this.transport), supportHtml: false } };
  }
  private indisponible(erreur: string): ResultatLivraisonProviderNotification { return { succes: false, canal: 'EMAIL', fournisseur: this.obtenirNom(), horodatage: new Date(), erreur, metadata: { configure: Boolean(this.transport) } }; }
}
