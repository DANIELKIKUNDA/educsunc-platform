import swagger from '@fastify/swagger';
import type { FastifyInstance } from 'fastify';

import { configurationApplication } from '../../config/app.config';

export interface ConfigurationOpenApi {
  active: boolean;
  nomApplication: string;
  versionApplication: string;
}

const configurationParDefaut: ConfigurationOpenApi = {
  active: configurationApplication.activerOpenApi,
  nomApplication: configurationApplication.nomApplication,
  versionApplication: configurationApplication.versionApplication,
};

export async function configurerOpenApi(
  serveur: FastifyInstance,
  configuration: ConfigurationOpenApi = configurationParDefaut,
): Promise<void> {
  if (!configuration.active) {
    return;
  }

  await serveur.register(swagger, {
    openapi: {
      openapi: '3.1.0',
      info: {
        title: `${configuration.nomApplication} - catalogue HTTP`,
        description:
          'Inventaire officiel des routes EduSync. Les schemas detailles sont publies lorsqu ils existent.',
        version: configuration.versionApplication,
      },
      tags: [
        { name: 'sante', description: 'Vivacite et disponibilite du service.' },
        { name: 'plateforme', description: 'Capacites de la plateforme EduSync.' },
      ],
    },
  });
}

export async function enregistrerRouteOpenApi(
  serveur: FastifyInstance,
  configuration: ConfigurationOpenApi = configurationParDefaut,
): Promise<void> {
  if (!configuration.active) {
    return;
  }

  serveur.get(
    '/openapi.json',
    { schema: { hide: true } },
    async (_requete, reponse) => reponse.send(serveur.swagger()),
  );
}
