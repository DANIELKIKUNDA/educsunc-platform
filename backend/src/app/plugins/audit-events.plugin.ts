import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';

type PluginGlobal = FastifyPluginAsync & { nom: string };

// Ce plugin relie Audit au bus d evenements et publie des traces runtime structurantes.
export const auditEventsPlugin: PluginGlobal = Object.assign(
  async (serveur: Parameters<FastifyPluginAsync>[0]) => {
    serveur.addHook('onResponse', async (requete: FastifyRequest, reponse: FastifyReply) => {
      await serveur.audit.integrationEventBus.publisher.publier({
        name: 'AuditHttpRequestObserved',
        auditContext: requete.auditContext,
        payload: {
          methode: requete.method,
          route: requete.url,
          statusCode: reponse.statusCode,
          dateAction: new Date().toISOString(),
        },
      });
    });

    serveur.addHook('onError', async (requete, _reponse, erreur) => {
      await serveur.audit.integrationEventBus.publisher.publier({
        name: 'AuditHttpRequestFailed',
        auditContext: requete.auditContext,
        payload: {
          route: requete.url,
          methode: requete.method,
          erreur: erreur.message,
          dateAction: new Date().toISOString(),
        },
      });
    });

    serveur.log.info(
      {
        contexte: {
          plugin: 'audit-events',
        },
      },
      'Pont EventBus Audit initialise.',
    );
  },
  {
    nom: 'audit-events',
  },
);
