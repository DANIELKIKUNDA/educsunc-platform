// Ce fichier declare les types d integration Configuration pour Monitoring.

export interface MonitoringConfigurationEvenement {
  readonly type: 'THRESHOLD_UPDATED' | 'RETENTION_UPDATED' | 'RUNTIME_RELOADED';
  readonly cle: string;
  readonly valeur: unknown;
  readonly correlationId?: string;
}

export interface MonitoringConfigurationProjection {
  readonly thresholds: Readonly<Record<string, number>>;
  readonly retentionDays: number;
  readonly runtime: Readonly<Record<string, unknown>>;
}
