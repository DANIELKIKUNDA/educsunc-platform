// Ce fichier declare les types d integration Scolarite pour Monitoring.

export interface MonitoringScolariteEvenement {
  readonly type: string;
  readonly eleveId?: string;
  readonly correlationId?: string;
  readonly chargeUtile: Record<string, unknown>;
}
