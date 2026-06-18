// Ce fichier declare les types HTTP internes des controllers Monitoring.

export interface RequeteHttpMonitoring<Body = unknown, Params = unknown, Query = unknown> {
  readonly body?: Body;
  readonly params?: Params;
  readonly query?: Query;
  readonly headers?: Record<string, unknown>;
  readonly context?: unknown;
}

export interface ReponseControleurHttpMonitoring<T> {
  readonly statutHttp: number;
  readonly corps: T;
  readonly meta: {
    readonly correlationId?: string;
    readonly dureeMillisecondes: number;
  };
}
