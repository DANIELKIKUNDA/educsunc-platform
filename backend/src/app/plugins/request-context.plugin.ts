import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import {
  REQUEST_CONTEXT_HEADER_CORRELATION,
  RequestContextFactory,
} from 'shared/context';

type PluginGlobal = FastifyPluginAsync & { nom: string };

// Ce plugin initialise le RequestContext officiel avant tous les enrichissements suivants.
export const requestContextPlugin: PluginGlobal = Object.assign(
  async (serveur: Parameters<FastifyPluginAsync>[0]) => {
    serveur.decorateRequest(
      'context',
      undefined as unknown as ReturnType<typeof RequestContextFactory.creerContexteInitial>,
    );

    serveur.addHook('onRequest', async (requete: FastifyRequest) => {
      requete.context = RequestContextFactory.creerContexteInitial({
        requestId: String(requete.id),
        correlationId:
          typeof requete.headers[REQUEST_CONTEXT_HEADER_CORRELATION] === 'string'
            ? requete.headers[REQUEST_CONTEXT_HEADER_CORRELATION]
            : undefined,
        adresseIp: requete.ip,
        userAgent:
          typeof requete.headers['user-agent'] === 'string'
            ? requete.headers['user-agent']
            : undefined,
        deviceId:
          typeof requete.headers['x-device-id'] === 'string'
            ? requete.headers['x-device-id']
            : undefined,
      });
    });
  },
  {
    nom: 'request-context',
  },
);
