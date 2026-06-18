// Ce fichier declare les types d integration Referentiel pour Monitoring.

export interface MonitoringReferentielEvenement {
  readonly type: string;
  readonly composant: string;
  readonly correlationId?: string;
  readonly chargeUtile: Record<string, unknown>;
}
