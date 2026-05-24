export interface RuntimeContext {
  readonly environnement: string;
  readonly runtime: 'FASTIFY';
  readonly node: string;
  readonly worker?: string;
  readonly queue?: string;
  readonly scheduler?: string;
  readonly instance?: string;
  readonly version?: string;
}

