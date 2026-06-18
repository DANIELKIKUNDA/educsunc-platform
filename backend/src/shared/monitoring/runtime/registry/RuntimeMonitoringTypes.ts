import type { FacadeInfrastructureMonitoring } from '../../infrastructure';

// Ce fichier declare les types du runtime Monitoring.

export interface RuntimeMonitoringSnapshot {
  readonly nom: string;
  readonly demarre: boolean;
  readonly composantCount: number;
  readonly schedulerCount: number;
  readonly workerCount: number;
}

export interface RuntimeMonitoringContext {
  readonly infrastructure: FacadeInfrastructureMonitoring;
}
