// Ce fichier declare les types publics du socle Redis partage.

/** Cette union represente les valeurs atomiques que le socle Redis peut stocker nativement. */
export type ValeurRedisPrimitiveShared = string | number | boolean | null;

/** Cette union represente les valeurs serialisables acceptées par le client partage. */
export type ValeurRedisShared =
  | ValeurRedisPrimitiveShared
  | readonly ValeurRedisPrimitiveShared[]
  | Readonly<Record<string, ValeurRedisPrimitiveShared>>;

/** Cette interface decrit la configuration normalisee d'une connexion Redis partagee. */
export interface ConfigurationConnexionRedisShared {
  readonly modeConnexion: 'auto' | 'simulation' | 'reel';
  readonly host: string;
  readonly port: number;
  readonly username?: string;
  readonly password?: string;
  readonly database: number;
  readonly tlsActive: boolean;
  readonly prefixCle: string;
  readonly timeoutConnexionMs: number;
  readonly timeoutInactiviteMs: number;
}

/** Cette interface represente l'etat observable du client Redis partage. */
export interface EtatConnexionRedisShared {
  readonly fournisseur: 'redis';
  readonly connecte: boolean;
  readonly modeSimulation: boolean;
  readonly host: string;
  readonly port: number;
  readonly database: number;
  readonly prefixCle: string;
  readonly derniereConnexionLe?: Date;
  readonly derniereDeconnexionLe?: Date;
  readonly derniereErreur?: string;
}

/** Cette interface formalise le contrat du client Redis partage. */
export interface ContratClientRedisShared {
  connecter(): Promise<void>;
  deconnecter(): Promise<void>;
  ping(): Promise<'PONG'>;
  lire(cle: string): Promise<string | null>;
  ecrire(cle: string, valeur: string, ttlSecondes?: number): Promise<void>;
  lireJson<T extends ValeurRedisShared>(cle: string): Promise<T | null>;
  ecrireJson<T extends ValeurRedisShared>(cle: string, valeur: T, ttlSecondes?: number): Promise<void>;
  supprimer(cle: string): Promise<boolean>;
  definirExpiration(cle: string, ttlSecondes: number): Promise<boolean>;
  incrementer(cle: string, increment?: number): Promise<number>;
  observerEtat(): EtatConnexionRedisShared;
}
