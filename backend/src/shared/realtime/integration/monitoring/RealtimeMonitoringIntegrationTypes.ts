import type { PublierEvenementTempsReelCommand } from '../../application';

export type TypeEvenementMonitoringRealtime =
  | 'monitoring.alert.created'
  | 'monitoring.alert.resolved'
  | 'monitoring.incident.created'
  | 'monitoring.incident.status.changed'
  | 'monitoring.incident.resolved'
  | 'monitoring.component.degraded';

export interface RealtimeMonitoringSignal {
  readonly evenementId: string;
  readonly type: TypeEvenementMonitoringRealtime;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly requestId?: string;
  readonly correlationId?: string;
  readonly critique?: boolean;
}

export interface RealtimeMonitoringProjection {
  readonly totalSignaux: number;
  readonly dernierType?: string;
  readonly derniereEmission?: string;
}

export interface RealtimeMonitoringSnapshot extends RealtimeMonitoringProjection {
  readonly messages: readonly PublierEvenementTempsReelCommand[];
}
