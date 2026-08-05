import type { FastifyPluginAsync } from 'fastify';

import { configurationApplication } from '../../config/app.config';
import { obtenirPoolPostgresAuth } from '../../shared/auth/infrastructure';

interface HealthResponse {
  status: 'ok';
  service: string;
  version: string;
  timestamp: string;
}

interface ReadinessResponse extends HealthResponse {
  readiness: 'ready' | 'not_ready';
  dependencies: {
    postgres: {
      status: 'up' | 'down';
      latencyMs: number;
    };
  };
}

export interface ResultatVerificationDisponibilite {
  disponible: boolean;
  latenceMs: number;
}

export interface VerificateurDisponibilite {
  verifier(): Promise<ResultatVerificationDisponibilite>;
}

class VerificateurDisponibilitePostgres implements VerificateurDisponibilite {
  public async verifier(): Promise<ResultatVerificationDisponibilite> {
    const debut = process.hrtime.bigint();

    try {
      await obtenirPoolPostgresAuth().query('SELECT 1');
      return {
        disponible: true,
        latenceMs: Number(process.hrtime.bigint() - debut) / 1_000_000,
      };
    } catch {
      return {
        disponible: false,
        latenceMs: Number(process.hrtime.bigint() - debut) / 1_000_000,
      };
    }
  }
}

function creerReponseSante(): HealthResponse {
  return {
    status: 'ok',
    service: configurationApplication.nomApplication,
    version: configurationApplication.versionApplication,
    timestamp: new Date().toISOString(),
  };
}

const schemaSante = {
  type: 'object',
  required: ['status', 'service', 'version', 'timestamp'],
  properties: {
    status: { type: 'string', const: 'ok' },
    service: { type: 'string' },
    version: { type: 'string' },
    timestamp: { type: 'string', format: 'date-time' },
  },
} as const;

const schemaDisponibilite = {
  type: 'object',
  required: [
    'status',
    'service',
    'version',
    'timestamp',
    'readiness',
    'dependencies',
  ],
  properties: {
    ...schemaSante.properties,
    readiness: { type: 'string', enum: ['ready', 'not_ready'] },
    dependencies: {
      type: 'object',
      required: ['postgres'],
      properties: {
        postgres: {
          type: 'object',
          required: ['status', 'latencyMs'],
          properties: {
            status: { type: 'string', enum: ['up', 'down'] },
            latencyMs: { type: 'number', minimum: 0 },
          },
        },
      },
    },
  },
} as const;

export function creerRouteHealth(
  verificateur: VerificateurDisponibilite = new VerificateurDisponibilitePostgres(),
): FastifyPluginAsync {
  return async (serveur) => {
    serveur.get(
      '/health',
      { schema: { tags: ['sante'], response: { 200: schemaSante } } },
      async (): Promise<HealthResponse> => creerReponseSante(),
    );
    serveur.get(
      '/health/live',
      { schema: { tags: ['sante'], response: { 200: schemaSante } } },
      async (): Promise<HealthResponse> => creerReponseSante(),
    );
    serveur.get('/health/ready', {
      schema: {
        tags: ['sante'],
        response: {
          200: schemaDisponibilite,
          503: schemaDisponibilite,
        },
      },
    }, async (_requete, reponse) => {
      const resultat = await verificateur.verifier();
      const corps: ReadinessResponse = {
        ...creerReponseSante(),
        readiness: resultat.disponible ? 'ready' : 'not_ready',
        dependencies: {
          postgres: {
            status: resultat.disponible ? 'up' : 'down',
            latencyMs: Number(resultat.latenceMs.toFixed(2)),
          },
        },
      };

      return reponse.code(resultat.disponible ? 200 : 503).send(corps);
    });
  };
}

// Conserve la route historique tout en exposant les probes industrielles.
export const routeHealth = creerRouteHealth();
