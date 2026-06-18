import { ClientRedisShared, FabriqueConnexionRedisShared } from 'shared/infrastructure/redis';
import { PreferencesNotification } from '../../domain';
import { IndexCachePreferencesNotification } from './TypesCacheNotification';

// Ce fichier implemente la variante Redis du cache des preferences Notifications.

/** Cette classe conserve un miroir local tout en projetant les preferences dans Redis partage. */
export class CachePreferencesNotificationRedis {
  private readonly index: IndexCachePreferencesNotification = new Map();

  /** Ce constructeur fixe le TTL des preferences et relie le cache au client Redis partage. */
  constructor(
    private readonly ttlMs = 180_000,
    private readonly clientRedisShared: ClientRedisShared = FabriqueConnexionRedisShared.obtenirClient(),
  ) {}

  /** Cette methode enregistre des preferences dans le miroir local et dans Redis partage. */
  public enregistrer(destinataireId: string, preferences: PreferencesNotification): void {
    this.index.set(destinataireId, {
      cle: destinataireId,
      valeur: preferences,
      expireLe: new Date(Date.now() + this.ttlMs),
    });
    void this.clientRedisShared.ecrireJson(
      this.construireCleRedis(destinataireId),
      this.serialiserPreferences(preferences),
      this.calculerTtlSecondes(),
    );
  }

  /** Cette methode lit des preferences fraiches depuis le miroir local. */
  public lire(destinataireId: string): PreferencesNotification | null {
    const entree = this.index.get(destinataireId);
    if (!entree || entree.expireLe.getTime() <= Date.now()) {
      this.index.delete(destinataireId);
      void this.clientRedisShared.supprimer(this.construireCleRedis(destinataireId));
      return null;
    }
    return entree.valeur;
  }

  /** Cette methode invalide les preferences dans les deux couches de cache. */
  public invalider(destinataireId: string): void {
    this.index.delete(destinataireId);
    void this.clientRedisShared.supprimer(this.construireCleRedis(destinataireId));
  }

  /** Cette methode construit la cle Redis partagee des preferences. */
  private construireCleRedis(destinataireId: string): string {
    return `notifications:cache:preferences:${destinataireId}`;
  }

  /** Cette methode convertit un TTL millisecondes en secondes Redis. */
  private calculerTtlSecondes(): number {
    return Math.max(1, Math.ceil(this.ttlMs / 1000));
  }

  /** Cette methode serialise les preferences pour la projection Redis commune. */
  private serialiserPreferences(
    preferences: PreferencesNotification,
  ): Readonly<Record<string, string | number | boolean | null>> {
    return {
      identifiant: preferences.obtenirId(),
      niveau: preferences.niveau,
      canauxAutorises: JSON.stringify(preferences.obtenirCanauxAutorises()),
      canalPrefere: preferences.canalPrefere ?? null,
      mute: preferences.mute,
      verrouille: preferences.verrouille,
    };
  }
}
