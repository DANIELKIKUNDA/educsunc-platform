import type { GraviteAlerte } from '../enums';

// Ce fichier declare les seuils par defaut du domaine Monitoring.

/** Cette interface represente un seuil metier standard. */
export interface MonitoringThreshold {
  readonly warning: number;
  readonly critical: number;
  readonly unite: string;
  readonly graviteParDefaut: GraviteAlerte;
}

/** Cette constante centralise les seuils metier par defaut. */
export const MONITORING_THRESHOLDS: Readonly<Record<string, MonitoringThreshold>> = {
  api_latency_ms: {
    warning: 500,
    critical: 1200,
    unite: 'ms',
    graviteParDefaut: 'WARNING',
  },
  error_rate_percent: {
    warning: 3,
    critical: 10,
    unite: '%',
    graviteParDefaut: 'MAJOR',
  },
  queue_lag_count: {
    warning: 50,
    critical: 200,
    unite: 'count',
    graviteParDefaut: 'MAJOR',
  },
  cpu_percent: {
    warning: 75,
    critical: 90,
    unite: '%',
    graviteParDefaut: 'CRITICAL',
  },
};
