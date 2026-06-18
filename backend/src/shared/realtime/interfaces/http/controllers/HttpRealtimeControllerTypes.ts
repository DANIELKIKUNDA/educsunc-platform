export interface RequeteHttpRealtime<Body = unknown, Params = unknown, Query = unknown> {
  readonly body?: Body;
  readonly params?: Params;
  readonly query?: Query;
  readonly headers?: Record<string, unknown>;
  readonly context?: unknown;
}

export interface ReponseControleurHttpRealtime<T> {
  readonly statutHttp: number;
  readonly corps: T;
  readonly meta: {
    readonly correlationId?: string;
    readonly dureeMillisecondes: number;
  };
}
