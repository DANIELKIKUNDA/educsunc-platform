import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';

type PluginGlobal = FastifyPluginAsync & { nom: string };

const startedAtStore = new WeakMap<FastifyRequest, number>();

// Ce plugin relie les identifiants runtime Audit aux logs et aux reponses HTTP.
export const auditObservabilityPlugin: PluginGlobal = Object.assign(
  async (serveur: Parameters<FastifyPluginAsync>[0]) => {
    serveur.addHook('onRequest', async (requete: FastifyRequest) => {
      startedAtStore.set(requete, Date.now());
    });

    serveur.addHook('onResponse', async (requete: FastifyRequest, reponse: FastifyReply) => {
      const startedAt = startedAtStore.get(requete) ?? Date.now();
      const requestId = requete.requestId ?? requete.context?.requestId ?? String(requete.id);
      const correlationId = requete.correlationId ?? requete.context?.correlationId ?? requestId;
      const durationMs = Date.now() - startedAt;
      const now = new Date().toISOString();

      reponse.header('x-request-id', requestId);
      reponse.header('x-correlation-id', correlationId);

      serveur.audit.monitoringIntegration.enregistrerObservationHttp({
        requestId,
        correlationId,
        traceId: requete.auditContext?.trace.traceId,
        spanId: requete.auditContext?.trace.spanId,
        organisationId: requete.context?.organisationActiveId,
        ecoleId: requete.context?.ecoleActiveId,
        utilisateurId: requete.context?.utilisateurId,
        sessionId: requete.context?.sessionId,
        deviceId: requete.context?.deviceId,
        replayId: requete.auditContext?.replay.replayId,
        retryCount: requete.auditContext?.retry.retryCount,
        syncId: requete.context?.syncId,
        route: requete.url,
        method: requete.method,
        statusCode: reponse.statusCode,
        startedAt: new Date(startedAt).toISOString(),
        durationMs,
      });

      serveur.log.info(
        {
          contexte: {
            plugin: 'audit-observability',
            requestId,
            correlationId,
            route: requete.url,
            methode: requete.method,
            statusCode: reponse.statusCode,
            durationMs,
            observedAt: now,
            organisationId: requete.context?.organisationActiveId,
            ecoleId: requete.context?.ecoleActiveId,
          },
        },
        'Observation runtime Audit capturee.',
      );
    });
  },
  {
    nom: 'audit-observability',
  },
);
