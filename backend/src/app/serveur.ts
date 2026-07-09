import Fastify from 'fastify';

import { auditContextPlugin } from './plugins/audit-context.plugin';
import { auditEventsPlugin } from './plugins/audit-events.plugin';
import { auditObservabilityPlugin } from './plugins/audit-observability.plugin';
import { auditPlugin } from './plugins/audit.plugin';
import { auditWorkersPlugin } from './plugins/audit-workers.plugin';
import { authenticationPlugin } from './plugins/authentication.plugin';
import { baseDonneesPlugin } from './plugins/base-donnees.plugin';
import { journalisationPlugin } from './plugins/journalisation.plugin';
import { registerGlobalRoutes } from './routes';
import { requestContextPlugin } from './plugins/request-context.plugin';
import { securityPlugin } from './plugins/security.plugin';
import { tenancyPlugin } from './plugins/tenancy.plugin';
import { validationPlugin } from './plugins/validation.plugin';
import { configurationApplication } from '../config/app.config';
import { PinoLogger } from '../shared/infrastructure/logger/PinoLogger';

const pluginsGlobaux = [
  baseDonneesPlugin,
  validationPlugin,
  requestContextPlugin,
  authenticationPlugin,
  securityPlugin,
  tenancyPlugin,
  auditContextPlugin,
  auditPlugin,
  auditObservabilityPlugin,
  auditEventsPlugin,
  auditWorkersPlugin,
  journalisationPlugin,
];

const originesFrontendAutorisees = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4174',
  'http://127.0.0.1:4174',
]);

// Prepare les plugins globaux sans logique technique lourde.
const preparerPluginsGlobaux = (logger: PinoLogger): void => {
  for (const plugin of pluginsGlobaux) {
    logger.debug('Plugin global reserve.', {
      plugin: plugin.nom,
    });
  }
};

// Cree l'instance Fastify racine du backend.
export const createServer = () => {
  const logger = new PinoLogger();
  const serveur = Fastify({
    disableRequestLogging: configurationApplication.environnement === 'test',
    loggerInstance: logger.instance,
    pluginTimeout: 120000,
  });

  preparerPluginsGlobaux(logger);
  // Configure les entetes CORS necessaires au frontend local sans ajouter de dependance.
  serveur.addHook('onRequest', async (requete, reponse) => {
    const origine = requete.headers.origin;
    const origineAutorisee = typeof origine === 'string'
      && originesFrontendAutorisees.has(origine)
      ? origine
      : 'http://localhost:5173';

    reponse.header('Access-Control-Allow-Origin', origineAutorisee);
    reponse.header('Access-Control-Allow-Credentials', 'true');
    reponse.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
    reponse.header(
      'Access-Control-Allow-Headers',
      [
        'Accept',
        'Content-Type',
        'Authorization',
        'x-session-id',
        'x-device-id',
        'x-tenant-id',
        'x-organisation-id',
        'x-ecole-id',
        'x-user-id',
        'x-role-actif',
        'x-lecture-organisation',
        'Idempotency-Key',
        'x-request-id',
        'x-correlation-id',
        'x-offline-mode',
      ].join(','),
    );

    if (requete.method === 'OPTIONS') {
      await reponse.code(204).send();
    }
  });
  serveur.register(async (instance) => {
    for (const plugin of pluginsGlobaux) {
      await plugin(instance, {});
    }

    await instance.register(registerGlobalRoutes);
  });

  logger.info('Instance Fastify creee.', {
    environnement: configurationApplication.environnement,
    service: configurationApplication.nomApplication,
  });

  return serveur;
};
