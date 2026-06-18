// Ce fichier declare les types HTTP minimaux du module Configuration.

/** Cette interface represente une requete HTTP minimale exploitable par les controllers. */
export interface RequeteHttpConfiguration<
  TBody = unknown,
  TParams = Record<string, unknown>,
  TQuery = Record<string, unknown>,
> {
  readonly body?: TBody;
  readonly params?: TParams;
  readonly query?: TQuery;
  readonly headers?: Readonly<Record<string, unknown>>;
  readonly context?: Readonly<Record<string, unknown>>;
}

/** Cette interface represente l enveloppe de reponse standard du module. */
export interface ReponseControleurHttpConfiguration<TDonnees> {
  readonly succes: true;
  readonly code: number;
  readonly donnees: TDonnees;
  readonly meta: {
    readonly dureeMs: number;
    readonly correlationId?: string;
    readonly requestId?: string;
  };
}
