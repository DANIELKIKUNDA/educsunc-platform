// Ce fichier declare les types d integration Bulletins pour Monitoring.

export interface MonitoringBulletinsEvenement {
  readonly type: string;
  readonly bulletinId?: string;
  readonly correlationId?: string;
  readonly chargeUtile: Record<string, unknown>;
}
