import Fastify from 'fastify';

import { authentificationPlugin } from './plugins/authentification.plugin';
import { baseDonneesPlugin } from './plugins/base-donnees.plugin';
import { journalisationPlugin } from './plugins/journalisation.plugin';
import { registerGlobalRoutes } from './routes';
import { tenancyPlugin } from './plugins/tenancy.plugin';
import { validationPlugin } from './plugins/validation.plugin';
import { configurationApplication } from '../config/app.config';
import { PinoLogger } from '../shared/infrastructure/logger/PinoLogger';

const pluginsGlobaux = [
  baseDonneesPlugin,
  authentificationPlugin,
  validationPlugin,
  tenancyPlugin,
  journalisationPlugin,
];

const originesFrontendAutorisees = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
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
    reponse.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
    reponse.header(
      'Access-Control-Allow-Headers',
      'Accept,Content-Type,x-tenant-id,x-organisation-id,Idempotency-Key',
    );

    if (requete.method === 'OPTIONS') {
      await reponse.code(204).send();
    }
  });
  serveur.register(registerGlobalRoutes);

  logger.info('Instance Fastify creee.', {
    environnement: configurationApplication.environnement,
    service: configurationApplication.nomApplication,
  });

  return serveur;
};
