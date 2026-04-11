import type { FastifyPluginAsync } from 'fastify';

import { configurationApplication } from '../../config/app.config';

interface HealthResponse {
  status: 'ok';
  service: string;
  timestamp: string;
}

// Expose la route de supervision technique.
export const routeHealth: FastifyPluginAsync = async (serveur) => {
  serveur.get('/health', async (): Promise<HealthResponse> => {
    return {
      status: 'ok',
      service: configurationApplication.nomApplication,
      timestamp: new Date().toISOString(),
    };
  });
};
