// Ce fichier declare l etat de sante operational du module Configuration.

export interface EtatSanteConfigurationOperational {
  readonly composant: 'CACHE' | 'PROPAGATION' | 'RELOAD' | 'PERSISTENCE';
  readonly statut: 'HEALTHY' | 'DEGRADED';
  readonly details: string;
}
