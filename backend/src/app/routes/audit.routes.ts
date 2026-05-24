import type { FastifyPluginAsync } from 'fastify';
import { creerRoutesHttpAudit } from '../../shared/audit/interfaces/http/routes';

type PluginRoutesAudit = FastifyPluginAsync & {
  nom: string;
  prefixe: string;
};

// Ce plugin expose les routes HTTP Audit une fois le module runtime branche.
export const routeAudit: PluginRoutesAudit = Object.assign(
  async (serveur: Parameters<FastifyPluginAsync>[0]) => {
    await serveur.register(creerRoutesHttpAudit(serveur.audit.routesDependances));

    serveur.log.info(
      {
        contexte: {
          bc: 'shared-audit',
          prefixe: routeAudit.prefixe,
        },
      },
      'Routes Audit enregistrees.',
    );
  },
  {
    nom: 'audit',
    prefixe: '/api/v1',
  },
);
