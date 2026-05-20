import type { FastifyPluginAsync, FastifyRequest } from 'fastify';

type PluginGlobal = FastifyPluginAsync & { nom: string };

// Ce plugin journalise le contexte runtime final sans le modifier.
export const journalisationPlugin: PluginGlobal = Object.assign(
  async (serveur: Parameters<FastifyPluginAsync>[0]) => {
    serveur.addHook('onResponse', async (requete: FastifyRequest) => {
      serveur.log.info(
        {
          contexte: {
            requestId: requete.context?.requestId,
            utilisateurId: requete.context?.utilisateurId,
            roleActif: requete.context?.roleActif,
            organisationActiveId: requete.context?.organisationActiveId,
            ecoleActiveId: requete.context?.ecoleActiveId,
          },
          route: requete.routeOptions.url ?? requete.url,
          statut: requete.raw.statusCode,
        },
        'Traitement HTTP journalise.',
      );
    });
  },
  {
    nom: 'journalisation',
  },
);
