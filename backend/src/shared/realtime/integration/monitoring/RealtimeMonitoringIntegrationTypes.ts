export interface RealtimeMonitoringProjection {
  readonly totalSignaux: number;
  readonly dernierType?: string;
}

export interface RealtimeMonitoringEvenement {
  readonly type: string;
  readonly canal: string;
  readonly audience: number;
}
