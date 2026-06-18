// Ce fichier declare les types techniques de monitoring.

/** Cette union represente les signaux techniques exposes par l infrastructure Configuration. */
export type SignalMonitoringConfiguration =
  | 'CREATED'
  | 'UPDATED'
  | 'LOCKED'
  | 'UNLOCKED'
  | 'OVERRIDDEN'
  | 'SNAPSHOT'
  | 'DELETED';

/** Cette interface represente une observation technique de monitoring. */
export interface ObservationMonitoringConfiguration {
  readonly signal: SignalMonitoringConfiguration;
  readonly configurationId: string;
  readonly observeLe: Date;
}

/** Cette interface represente un etat technique de sante de l infrastructure. */
export interface EtatSanteConfiguration {
  readonly composant: 'PERSISTENCE' | 'CACHE' | 'PROPAGATION' | 'RELOAD';
  readonly statut: 'HEALTHY' | 'DEGRADED';
  readonly details: string;
  readonly observeLe: Date;
}
