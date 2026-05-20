import 'fastify';
import type { RequestContext } from './RequestContext';

declare module 'fastify' {
  interface FastifyRequest {
    context: RequestContext;
  }
}

export {};
