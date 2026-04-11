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
  serveur.register(registerGlobalRoutes);

  logger.info('Instance Fastify creee.', {
    environnement: configurationApplication.environnement,
    service: configurationApplication.nomApplication,
  });

  return serveur;
};
