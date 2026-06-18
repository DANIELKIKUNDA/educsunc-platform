export interface RealtimeConfigurationProjection {
  readonly canauxAutorises: readonly string[];
  readonly offlineFirst: boolean;
}

export interface RealtimeConfigurationEvenement {
  readonly type: 'REALTIME_CONFIGURATION_UPDATED';
  readonly canauxAutorises: readonly string[];
  readonly offlineFirst: boolean;
}
