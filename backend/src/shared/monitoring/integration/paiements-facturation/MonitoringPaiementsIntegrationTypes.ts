// Ce fichier declare les types d integration Paiements pour Monitoring.

export interface MonitoringPaiementsEvenement {
  readonly type: string;
  readonly factureId?: string;
  readonly correlationId?: string;
  readonly chargeUtile: Record<string, unknown>;
}
