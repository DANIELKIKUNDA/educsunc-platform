import { ClientRedisShared, FabriqueConnexionRedisShared } from 'shared/infrastructure/redis';
import { ModeleNotification } from '../../domain';
import { EntreeCacheNotification, IndexCacheTemplatesNotification } from './TypesCacheNotification';

// Ce fichier implemente la variante Redis du cache des templates Notifications.

/** Cette classe conserve un miroir local tout en projetant les cles de templates dans Redis partage. */
export class CacheTemplatesNotificationRedis {
  private readonly index: IndexCacheTemplatesNotification = new Map();

  /** Ce constructeur fixe le TTL des templates et relie le cache au client Redis partage. */
  constructor(
    private readonly ttlMs = 300_000,
    private readonly clientRedisShared: ClientRedisShared = FabriqueConnexionRedisShared.obtenirClient(),
  ) {}

  /** Cette methode enregistre un template dans le miroir local et dans Redis partage. */
  public enregistrer(cle: string, modele: ModeleNotification): void {
    const entree = this.construireEntree(cle, modele);
    this.index.set(cle, entree);
    void this.clientRedisShared.ecrireJson(
      this.construireCleRedis(cle),
      this.serialiserModele(modele),
      this.calculerTtlSecondes(),
    );
  }

  /** Cette methode lit un template frais depuis le miroir local. */
  public lire(cle: string): ModeleNotification | null {
    const entree = this.index.get(cle);
    if (!entree || this.estExpiree(entree)) {
      this.index.delete(cle);
      void this.clientRedisShared.supprimer(this.construireCleRedis(cle));
      return null;
    }
    return entree.valeur;
  }

  /** Cette methode invalide un template dans les deux couches de cache. */
  public invalider(cle: string): void {
    this.index.delete(cle);
    void this.clientRedisShared.supprimer(this.construireCleRedis(cle));
  }

  /** Cette methode construit une entree de cache standardisee. */
  private construireEntree(cle: string, modele: ModeleNotification): EntreeCacheNotification<ModeleNotification> {
    return {
      cle,
      valeur: modele,
      expireLe: new Date(Date.now() + this.ttlMs),
    };
  }

  /** Cette methode detecte si une entree locale a deja expire. */
  private estExpiree(entree: EntreeCacheNotification<ModeleNotification>): boolean {
    return entree.expireLe.getTime() <= Date.now();
  }

  /** Cette methode construit la cle Redis partagee du template. */
  private construireCleRedis(cle: string): string {
    return `notifications:cache:templates:${cle}`;
  }

  /** Cette methode convertit un TTL millisecondes en secondes Redis. */
  private calculerTtlSecondes(): number {
    return Math.max(1, Math.ceil(this.ttlMs / 1000));
  }

  /** Cette methode serialise un modele pour la projection Redis commune. */
  private serialiserModele(
    modele: ModeleNotification,
  ): Readonly<Record<string, string | number | boolean | null>> {
    return {
      identifiant: modele.obtenirId(),
      codeModele: modele.codeModele,
      canal: modele.canal,
      typeNotification: modele.typeNotification,
      version: modele.version,
      corps: modele.corps,
      placeholdersObligatoires: JSON.stringify([...modele.placeholdersObligatoires]),
      verrouille: modele.verrouille,
    };
  }
}
