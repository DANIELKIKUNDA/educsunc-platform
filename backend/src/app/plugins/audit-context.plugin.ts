import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { creerAuditContext } from 'shared/audit/context';

type PluginGlobal = FastifyPluginAsync & { nom: string };

// Ce plugin projette le contexte runtime partage vers request.auditContext pour Audit.
export const auditContextPlugin: PluginGlobal = Object.assign(
  async (serveur: Parameters<FastifyPluginAsync>[0]) => {
    serveur.decorateRequest('auditContext', undefined);
    serveur.decorateRequest('requestId', undefined);
    serveur.decorateRequest('correlationId', undefined);

    serveur.addHook('preHandler', async (requete: FastifyRequest) => {
      const requestId = requete.context?.requestId ?? String(requete.id);
      const correlationId = requete.context?.correlationId ?? requestId;

      requete.requestId = requestId;
      requete.correlationId = correlationId;
      requete.auditContext = requete.context
        ? creerAuditContext(requete, {
            ...requete.context,
            requestId,
            correlationId,
          })
        : undefined;
    });
  },
  {
    nom: 'audit-context',
  },
);
