import type { FastifyInstance, InjectOptions, LightMyRequestResponse } from 'fastify';
import type { ActeurGlobalTest } from '../setup/GlobalTestBootstrap';

// Ce fichier fournit les petites aides de confort des tests globaux.

export async function injecterCommeActeur(
  serveur: FastifyInstance,
  acteur: ActeurGlobalTest,
  options: InjectOptions,
): Promise<LightMyRequestResponse> {
  return serveur.inject({
    ...options,
    headers: {
      authorization: `Bearer ${acteur.accessToken}`,
      'x-session-id': acteur.sessionId,
      'x-device-id': acteur.deviceId,
      'x-organisation-id': acteur.organisationId,
      'x-tenant-id': acteur.ecoleId,
      ...(options.headers ?? {}),
    },
  });
}

export function mesurerDuree(operation: () => Promise<unknown> | unknown): Promise<number> {
  const debut = Date.now();
  return Promise.resolve(operation()).then(() => Date.now() - debut);
}

export async function executerEnParallele<T>(
  repetitions: number,
  operation: (index: number) => Promise<T>,
): Promise<T[]> {
  return Promise.all(Array.from({ length: repetitions }, (_, index) => operation(index)));
}
