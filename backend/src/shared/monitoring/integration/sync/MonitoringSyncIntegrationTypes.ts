// Ce fichier declare les types d integration Sync pour Monitoring.

export interface MonitoringSyncEvenement {
  readonly type: string;
  readonly resourceId: string;
  readonly correlationId?: string;
  readonly statut: 'STARTED' | 'COMPLETED' | 'FAILED';
}
