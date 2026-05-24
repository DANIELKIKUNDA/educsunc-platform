import type { FastifyPluginAsync } from 'fastify';
import { creerAuditRuntime } from './audit-runtime';

type PluginGlobal = FastifyPluginAsync & { nom: string };

// Ce plugin principal initialise le module Audit et expose app.audit au runtime Fastify.
export const auditPlugin: PluginGlobal = Object.assign(
  async (serveur: Parameters<FastifyPluginAsync>[0]) => {
    if (!serveur.hasDecorator('audit')) {
      serveur.decorate('audit', creerAuditRuntime());
    }

    const configuration = serveur.audit.configuration.obtenirParDefaut();
    serveur.log.info(
      {
        contexte: {
          plugin: 'audit',
          workers: configuration.workers,
          queues: configuration.queues,
        },
      },
      'Module Audit initialise dans le runtime Fastify.',
    );
  },
  {
    nom: 'audit',
  },
);
