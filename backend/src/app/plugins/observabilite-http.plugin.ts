import { timingSafeEqual } from 'node:crypto';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import {
  collectDefaultMetrics,
  Counter,
  Gauge,
  Histogram,
  Registry,
} from 'prom-client';

import { configurationApplication } from '../../config/app.config';

export interface ConfigurationObservabiliteHttp {
  activerMetriques: boolean;
  environnement: string;
  jetonMetriques?: string;
}

const configurationParDefaut: ConfigurationObservabiliteHttp = {
  activerMetriques: configurationApplication.activerMetriques,
  environnement: configurationApplication.environnement,
  jetonMetriques: configurationApplication.jetonMetriques,
};

function jetonsIdentiques(attendu: string, recu: string | undefined): boolean {
  if (!recu) {
    return false;
  }

  const attenduBuffer = Buffer.from(attendu);
  const recuBuffer = Buffer.from(recu);

  return attenduBuffer.length === recuBuffer.length
    && timingSafeEqual(attenduBuffer, recuBuffer);
}

function lireJeton(requete: FastifyRequest): string | undefined {
  const autorisation = requete.headers.authorization;

  if (typeof autorisation !== 'string' || !autorisation.startsWith('Bearer ')) {
    return undefined;
  }

  const jeton = autorisation.slice('Bearer '.length).trim();
  return jeton || undefined;
}

function routeNormalisee(requete: FastifyRequest): string {
  return requete.routeOptions.url ?? 'route_inconnue';
}

export async function configurerObservabiliteHttp(
  serveur: FastifyInstance,
  configuration: ConfigurationObservabiliteHttp = configurationParDefaut,
): Promise<void> {
  if (!configuration.activerMetriques) {
    return;
  }

  if (configuration.environnement === 'production' && !configuration.jetonMetriques) {
    throw new Error(
      'EDUCSYN_METRICS_TOKEN est obligatoire lorsque les metriques sont activees en production.',
    );
  }

  const registre = new Registry();
  const debutRequetes = new WeakMap<FastifyRequest, bigint>();
  collectDefaultMetrics({ prefix: 'edusync_', register: registre });

  const requetesTotal = new Counter({
    name: 'edusync_http_requests_total',
    help: 'Nombre total de requetes HTTP traitees.',
    labelNames: ['method', 'route', 'status_code'] as const,
    registers: [registre],
  });
  const dureeRequetes = new Histogram({
    name: 'edusync_http_request_duration_seconds',
    help: 'Duree des requetes HTTP en secondes.',
    labelNames: ['method', 'route', 'status_code'] as const,
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    registers: [registre],
  });
  const requetesActives = new Gauge({
    name: 'edusync_http_requests_in_progress',
    help: 'Nombre de requetes HTTP en cours.',
    registers: [registre],
  });

  serveur.addHook('onRequest', async (requete) => {
    debutRequetes.set(requete, process.hrtime.bigint());
    requetesActives.inc();
  });

  serveur.addHook('onResponse', async (requete, reponse) => {
    requetesActives.dec();
    const debut = debutRequetes.get(requete);
    const dureeSecondes = debut
      ? Number(process.hrtime.bigint() - debut) / 1_000_000_000
      : 0;
    const labels = {
      method: requete.method,
      route: routeNormalisee(requete),
      status_code: String(reponse.statusCode),
    };

    requetesTotal.inc(labels);
    dureeRequetes.observe(labels, dureeSecondes);
  });

  serveur.get(
    '/metrics',
    {
      schema: { hide: true },
      preHandler: async (requete: FastifyRequest, reponse: FastifyReply) => {
        if (
          configuration.jetonMetriques
          && !jetonsIdentiques(configuration.jetonMetriques, lireJeton(requete))
        ) {
          return reponse.code(401).send({
            success: false,
            code: 'METRICS_AUTH_REQUIRED',
            message: 'Authentification de supervision requise.',
          });
        }
      },
    },
    async (_requete, reponse) => reponse
      .header('content-type', registre.contentType)
      .send(await registre.metrics()),
  );

  serveur.addHook('onClose', async () => {
    registre.clear();
  });
}
