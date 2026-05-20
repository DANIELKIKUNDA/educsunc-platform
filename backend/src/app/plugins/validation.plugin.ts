import type { FastifyPluginAsync } from 'fastify';

type PluginGlobal = FastifyPluginAsync & { nom: string };

// Ce plugin reserve l etape globale de validation technique avant securisation.
export const validationPlugin: PluginGlobal = Object.assign(
  async () => {},
  {
    nom: 'validation',
  },
);
