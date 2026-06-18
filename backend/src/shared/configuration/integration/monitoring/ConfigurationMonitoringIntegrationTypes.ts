import type { ConfigurationContext } from '../../context';

// Ce fichier declare les types du pont Monitoring.

export interface ConfigurationMonitoringObservation {
  readonly source: 'GENERAL' | 'CACHE' | 'RELOAD' | 'PROPAGATION' | 'AUDIT';
  readonly niveau: 'INFO' | 'WARN' | 'ERROR';
  readonly message: string;
  readonly contexte: ConfigurationContext;
  readonly observeLe: Date;
}

export interface ConfigurationMonitoringSnapshot {
  readonly observations: readonly ConfigurationMonitoringObservation[];
  readonly totalObservations: number;
}
