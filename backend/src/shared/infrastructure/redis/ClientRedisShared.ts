import { createClient, RedisClientType } from 'redis';
import type {
  ConfigurationConnexionRedisShared,
  ContratClientRedisShared,
  EtatConnexionRedisShared,
  ValeurRedisShared,
} from './TypesRedisShared';

type EntreeRedisMemoireShared = {
  valeur: string;
  expirationLe?: number;
};

type ClientRedisNatifShared = RedisClientType;

// Ce fichier heberge le client Redis partage en mode hybride reel/simulation.

/** Cette classe expose un contrat Redis commun capable d utiliser un vrai driver ou un repli local. */
export class ClientRedisShared implements ContratClientRedisShared {
  private readonly stockage = new Map<string, EntreeRedisMemoireShared>();
  private clientRedisNatif?: ClientRedisNatifShared;
  private etatConnexion: EtatConnexionRedisShared;

  /** Ce constructeur memorise la configuration normalisee et prepare l etat de connexion. */
  constructor(private readonly configuration: ConfigurationConnexionRedisShared) {
    this.etatConnexion = {
      fournisseur: 'redis',
      connecte: false,
      modeSimulation: configuration.modeConnexion === 'simulation',
      host: configuration.host,
      port: configuration.port,
      database: configuration.database,
      prefixCle: configuration.prefixCle,
    };
  }

  /** Cette methode active le client partage en mode reel ou local selon la disponibilite Redis. */
  public async connecter(): Promise<void> {
    if (this.etatConnexion.connecte) {
      return;
    }

    if (this.configuration.modeConnexion === 'simulation') {
      this.basculerEnSimulation();
      return;
    }

    try {
      const client = this.obtenirClientNatif();
      if (!client.isOpen) {
        await client.connect();
      }
      this.etatConnexion = {
        ...this.etatConnexion,
        connecte: true,
        modeSimulation: false,
        derniereConnexionLe: new Date(),
        derniereErreur: undefined,
      };
    } catch (erreur) {
      const message = this.normaliserErreur(erreur);
      if (this.configuration.modeConnexion === 'reel') {
        this.etatConnexion = {
          ...this.etatConnexion,
          connecte: false,
          modeSimulation: false,
          derniereErreur: message,
        };
        throw new Error(`Connexion Redis reelle impossible: ${message}`);
      }

      this.basculerEnSimulation(message);
    }
  }

  /** Cette methode ferme le client partage courant. */
  public async deconnecter(): Promise<void> {
    if (this.clientRedisNatif?.isOpen) {
      await this.clientRedisNatif.disconnect();
    }
    this.etatConnexion = {
      ...this.etatConnexion,
      connecte: false,
      derniereDeconnexionLe: new Date(),
    };
  }

  /** Cette methode retourne un ping Redis reel ou simule selon le mode actif. */
  public async ping(): Promise<'PONG'> {
    await this.verifierConnexion();
    if (!this.etatConnexion.modeSimulation) {
      const reponse = await this.obtenirClientNatif().ping();
      return reponse === 'PONG' ? 'PONG' : 'PONG';
    }
    return 'PONG';
  }

  /** Cette methode lit une valeur brute depuis Redis ou le miroir local. */
  public async lire(cle: string): Promise<string | null> {
    await this.verifierConnexion();
    if (!this.etatConnexion.modeSimulation) {
      return this.obtenirClientNatif().get(this.construireCle(cle));
    }

    const cleTechnique = this.construireCle(cle);
    const entree = this.stockage.get(cleTechnique);

    if (!entree) {
      return null;
    }
    if (this.estExpiree(entree)) {
      this.stockage.delete(cleTechnique);
      return null;
    }

    return entree.valeur;
  }

  /** Cette methode ecrit une valeur brute dans Redis ou le miroir local. */
  public async ecrire(cle: string, valeur: string, ttlSecondes?: number): Promise<void> {
    await this.verifierConnexion();
    if (!this.etatConnexion.modeSimulation) {
      const client = this.obtenirClientNatif();
      if (ttlSecondes !== undefined && ttlSecondes > 0) {
        await client.set(this.construireCle(cle), valeur, {
          expiration: {
            type: 'EX',
            value: ttlSecondes,
          },
        });
        return;
      }

      await client.set(this.construireCle(cle), valeur);
      return;
    }

    this.stockage.set(this.construireCle(cle), {
      valeur,
      expirationLe: this.calculerExpiration(ttlSecondes),
    });
  }

  /** Cette methode lit une valeur JSON serialisee dans Redis. */
  public async lireJson<T extends ValeurRedisShared>(cle: string): Promise<T | null> {
    const valeur = await this.lire(cle);
    if (valeur === null) {
      return null;
    }

    try {
      return JSON.parse(valeur) as T;
    } catch {
      return null;
    }
  }

  /** Cette methode ecrit une valeur JSON serialisee dans Redis. */
  public async ecrireJson<T extends ValeurRedisShared>(
    cle: string,
    valeur: T,
    ttlSecondes?: number,
  ): Promise<void> {
    await this.ecrire(cle, JSON.stringify(valeur), ttlSecondes);
  }

  /** Cette methode supprime une cle et indique si elle existait. */
  public async supprimer(cle: string): Promise<boolean> {
    await this.verifierConnexion();
    if (!this.etatConnexion.modeSimulation) {
      const total = await this.obtenirClientNatif().del(this.construireCle(cle));
      return total > 0;
    }
    return this.stockage.delete(this.construireCle(cle));
  }

  /** Cette methode assigne ou remplace un TTL sur une entree existante. */
  public async definirExpiration(cle: string, ttlSecondes: number): Promise<boolean> {
    await this.verifierConnexion();
    if (!this.etatConnexion.modeSimulation) {
      return (await this.obtenirClientNatif().expire(this.construireCle(cle), ttlSecondes)) > 0;
    }

    const cleTechnique = this.construireCle(cle);
    const entree = this.stockage.get(cleTechnique);

    if (!entree || this.estExpiree(entree)) {
      this.stockage.delete(cleTechnique);
      return false;
    }

    this.stockage.set(cleTechnique, {
      ...entree,
      expirationLe: this.calculerExpiration(ttlSecondes),
    });
    return true;
  }

  /** Cette methode incremente un compteur numerique brut. */
  public async incrementer(cle: string, increment = 1): Promise<number> {
    await this.verifierConnexion();
    if (!this.etatConnexion.modeSimulation) {
      return this.obtenirClientNatif().incrBy(this.construireCle(cle), increment);
    }

    const valeurActuelle = await this.lire(cle);
    const compteurCourant = valeurActuelle === null ? 0 : Number(valeurActuelle);
    const valeurSuivante = (Number.isFinite(compteurCourant) ? compteurCourant : 0) + increment;
    await this.ecrire(cle, String(valeurSuivante));
    return valeurSuivante;
  }

  /** Cette methode expose l etat courant du client partage. */
  public observerEtat(): EtatConnexionRedisShared {
    return { ...this.etatConnexion };
  }

  /** Cette methode expose la configuration normalisee utile aux autres adapters techniques. */
  public lireConfiguration(): ConfigurationConnexionRedisShared {
    return { ...this.configuration };
  }

  /** Cette methode garantit qu un appel n utilise pas un client non connecte. */
  private async verifierConnexion(): Promise<void> {
    if (!this.etatConnexion.connecte) {
      await this.connecter();
    }
  }

  /** Cette methode retourne le client Redis natif en le creant a la demande. */
  private obtenirClientNatif(): ClientRedisNatifShared {
    if (!this.clientRedisNatif) {
      this.clientRedisNatif = createClient({
        username: this.configuration.username,
        password: this.configuration.password,
        database: this.configuration.database,
        socket: this.configuration.tlsActive
          ? {
              host: this.configuration.host,
              port: this.configuration.port,
              connectTimeout: this.configuration.timeoutConnexionMs,
              reconnectStrategy: false,
              tls: true,
            }
          : {
              host: this.configuration.host,
              port: this.configuration.port,
              connectTimeout: this.configuration.timeoutConnexionMs,
              reconnectStrategy: false,
            },
      });
      this.clientRedisNatif.on('error', (erreur) => {
        this.etatConnexion = {
          ...this.etatConnexion,
          derniereErreur: this.normaliserErreur(erreur),
        };
      });
    }

    return this.clientRedisNatif;
  }

  /** Cette methode active explicitement le repli local memoire. */
  private basculerEnSimulation(raison?: string): void {
    this.etatConnexion = {
      ...this.etatConnexion,
      connecte: true,
      modeSimulation: true,
      derniereConnexionLe: new Date(),
      derniereErreur: raison,
    };
  }

  /** Cette methode prefixe les cles pour isoler les usages Redis du projet. */
  private construireCle(cle: string): string {
    return `${this.configuration.prefixCle}:${cle}`;
  }

  /** Cette methode calcule un timestamp d expiration a partir d un TTL en secondes. */
  private calculerExpiration(ttlSecondes?: number): number | undefined {
    if (ttlSecondes === undefined || !Number.isFinite(ttlSecondes) || ttlSecondes <= 0) {
      return undefined;
    }
    return Date.now() + ttlSecondes * 1000;
  }

  /** Cette methode indique si une entree memoire a deja expire. */
  private estExpiree(entree: EntreeRedisMemoireShared): boolean {
    return entree.expirationLe !== undefined && entree.expirationLe <= Date.now();
  }

  /** Cette methode normalise une erreur technique en message lisible. */
  private normaliserErreur(erreur: unknown): string {
    return erreur instanceof Error ? erreur.message : 'Erreur Redis inconnue.';
  }
}
