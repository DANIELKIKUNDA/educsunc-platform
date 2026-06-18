export interface RuntimeRealtimeContext {
  readonly nom: 'realtime-runtime';
  readonly offlineFirst: boolean;
}

export interface RuntimeRealtimeSnapshot {
  readonly nom: string;
  readonly demarre: boolean;
  readonly connexionCount: number;
  readonly abonnementCount: number;
  readonly workerCount: number;
  readonly composantCount: number;
}
