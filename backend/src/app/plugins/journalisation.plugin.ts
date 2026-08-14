import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';

type PluginGlobal = FastifyPluginAsync & { nom: string };

// Ce plugin journalise le contexte runtime final sans le modifier.
export const journalisationPlugin: PluginGlobal = Object.assign(
  async (serveur: Parameters<FastifyPluginAsync>[0]) => {
    const debuts = new WeakMap<FastifyRequest, bigint>();

    serveur.addHook('onRequest', async (requete: FastifyRequest) => {
      debuts.set(requete, process.hrtime.bigint());
    });

    serveur.addHook('onResponse', async (requete: FastifyRequest, reponse: FastifyReply) => {
      const debut = debuts.get(requete);
      const dureeMs = debut
        ? Number(process.hrtime.bigint() - debut) / 1_000_000
        : undefined;

      serveur.log.info(
        {
          requestId: requete.context?.requestId,
          correlationId: requete.context?.correlationId,
          service: 'edusync-backend',
          composant: 'http',
          methode: requete.method,
          route: requete.routeOptions.url ?? 'route_inconnue',
          statut: reponse.statusCode,
          dureeMs: dureeMs === undefined ? undefined : Number(dureeMs.toFixed(2)),
        },
        'Traitement HTTP journalise.',
      );
    });
  },
  {
    nom: 'journalisation',
  },
);
