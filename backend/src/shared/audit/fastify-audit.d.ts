import 'fastify';
import type { AuditContext } from './context';
import type { AuditRuntime } from '../../app/plugins/audit-runtime';

declare module 'fastify' {
  interface FastifyInstance {
    audit: AuditRuntime;
  }

  interface FastifyRequest {
    auditContext?: AuditContext;
    requestId?: string;
    correlationId?: string;
  }
}

export {};
