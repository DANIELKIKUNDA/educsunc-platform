import type { FastifyPluginAsync } from 'fastify';

type PluginGlobal = FastifyPluginAsync & { nom: string };

// Ce plugin reserve l etape d initialisation transverse de la persistence.
export const baseDonneesPlugin: PluginGlobal = Object.assign(
  async () => {},
  {
    nom: 'base-donnees',
  },
);
