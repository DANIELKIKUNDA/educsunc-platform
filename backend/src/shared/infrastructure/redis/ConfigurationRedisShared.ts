import type { ConfigurationConnexionRedisShared } from './TypesRedisShared';

// Ce fichier normalise la configuration Redis partagee du socle backend.

/** Cette classe centralise la resolution de la configuration Redis commune. */
export class ConfigurationRedisShared {
  /** Cette methode lit les variables d environnement et retourne une configuration stable. */
  public static lireDepuisEnvironnement(
    environnement: NodeJS.ProcessEnv = process.env,
  ): ConfigurationConnexionRedisShared {
    return {
      modeConnexion: this.lireModeConnexion(environnement.EDUCSYN_REDIS_MODE),
      host: this.lireChaine(environnement.EDUCSYN_REDIS_HOST, '127.0.0.1'),
      port: this.lireNombre(environnement.EDUCSYN_REDIS_PORT, 6379),
      username: this.lireOptionnelle(environnement.EDUCSYN_REDIS_USERNAME),
      password: this.lireOptionnelle(environnement.EDUCSYN_REDIS_PASSWORD),
      database: this.lireNombre(environnement.EDUCSYN_REDIS_DB, 0),
      tlsActive: this.lireBooleen(environnement.EDUCSYN_REDIS_TLS, false),
      prefixCle: this.lireChaine(environnement.EDUCSYN_REDIS_PREFIX, 'educsyn'),
      timeoutConnexionMs: this.lireNombre(environnement.EDUCSYN_REDIS_CONNECT_TIMEOUT_MS, 5_000),
      timeoutInactiviteMs: this.lireNombre(environnement.EDUCSYN_REDIS_IDLE_TIMEOUT_MS, 30_000),
    };
  }

  /** Cette methode lit une chaine nettoyee avec fallback. */
  private static lireChaine(valeur: string | undefined, fallback: string): string {
    const propre = String(valeur ?? '').trim();
    return propre.length > 0 ? propre : fallback;
  }

  /** Cette methode lit une variable numerique avec fallback. */
  private static lireNombre(valeur: string | undefined, fallback: number): number {
    const nombre = Number(valeur);
    return Number.isFinite(nombre) ? nombre : fallback;
  }

  /** Cette methode lit une variable booleenne simple. */
  private static lireBooleen(valeur: string | undefined, fallback: boolean): boolean {
    if (valeur === undefined) {
      return fallback;
    }

    const normalisee = valeur.trim().toLowerCase();
    if (['1', 'true', 'yes', 'on'].includes(normalisee)) {
      return true;
    }
    if (['0', 'false', 'no', 'off'].includes(normalisee)) {
      return false;
    }
    return fallback;
  }

  /** Cette methode lit une variable texte optionnelle. */
  private static lireOptionnelle(valeur: string | undefined): string | undefined {
    const propre = String(valeur ?? '').trim();
    return propre.length > 0 ? propre : undefined;
  }

  /** Cette methode lit le mode de connexion Redis partage. */
  private static lireModeConnexion(
    valeur: string | undefined,
  ): ConfigurationConnexionRedisShared['modeConnexion'] {
    const normalisee = String(valeur ?? '').trim().toLowerCase();
    if (normalisee === 'simulation') {
      return 'simulation';
    }
    if (normalisee === 'reel' || normalisee === 'real') {
      return 'reel';
    }
    return 'auto';
  }
}
