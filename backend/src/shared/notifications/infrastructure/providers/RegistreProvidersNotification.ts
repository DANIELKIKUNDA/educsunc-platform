import { CanalNotification } from '../../domain';
import { ProviderNotificationTechnique, RapportSanteProviderNotification } from './TypesProvidersNotification';

// Ce fichier heberge le registre technique des providers Notifications.

/** Cette classe centralise l'enregistrement et la resolution des providers par canal. */
export class RegistreProvidersNotification {
  /** Cette map stocke les providers techniques par canal. */
  private readonly providersParCanal = new Map<CanalNotification, ProviderNotificationTechnique[]>();

  /** Cette methode enregistre un provider pour son canal cible. */
  public enregistrer(provider: ProviderNotificationTechnique): void {
    const canal = provider.obtenirCanal();
    const existants = this.providersParCanal.get(canal) ?? [];
    existants.push(provider);
    this.providersParCanal.set(canal, existants);
  }

  /** Cette methode retourne le provider prefere pour un canal donne. */
  public resoudrePrincipal(canal: CanalNotification): ProviderNotificationTechnique | null {
    return this.providersParCanal.get(canal)?.[0] ?? null;
  }

  /** Cette methode retourne tous les providers declares pour un canal. */
  public listerParCanal(canal: CanalNotification): ProviderNotificationTechnique[] {
    return [...(this.providersParCanal.get(canal) ?? [])];
  }

  /** Cette methode retourne tous les providers declares dans le registre. */
  public listerTous(): ProviderNotificationTechnique[] {
    return [...this.providersParCanal.values()].flat();
  }

  /** Cette methode retourne un snapshot de sante de tous les providers connus. */
  public async verifierSanteGlobale(): Promise<RapportSanteProviderNotification[]> {
    return Promise.all(this.listerTous().map((provider) => provider.verifierSante()));
  }
}
