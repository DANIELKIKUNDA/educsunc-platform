import assert from 'node:assert/strict';
import test from 'node:test';
import Fastify from 'fastify';

import { creerAuthenticationPlugin } from '../../app/plugins/authentication.plugin';
import { requestContextPlugin } from '../../app/plugins/request-context.plugin';
import { JwtTokenAdapter, SessionCacheService } from '../../shared/auth/infrastructure';
import { SessionApplicationService } from '../../shared/auth/application/services/SessionApplicationService';
import { creerRepositoriesMemoire } from '../../shared/auth/tests/support/AuthTestSupport';

const routesPriveesRepresentatives = [
  '/api/v1/audit/probe',
  '/api/v1/configuration/probe',
  '/api/v1/monitoring/probe',
  '/api/v1/notifications/probe',
  '/api/v1/security/probe',
  '/api/referentiels/probe',
  '/api/eleves/probe',
  '/api/paiements/probe',
  '/api/bulletins/probe',
] as const;

async function creerServeurProtege() {
  const repositories = creerRepositoriesMemoire();
  const serveur = Fastify();

  await requestContextPlugin(serveur, {});
  await creerAuthenticationPlugin({
    jwtTokenAdapter: new JwtTokenAdapter(),
    utilisateurAuthRepository: repositories.depotUtilisateurAuth,
    contexteActifAuthRepository: repositories.depotContexteActifAuth,
    sessionApplicationService: new SessionApplicationService(
      repositories.depotSessionUtilisateur,
      repositories.depotRefreshToken,
      new SessionCacheService(),
    ),
    environment: 'production',
  })(serveur, {});

  serveur.get('/health', async () => ({ status: 'ok' }));
  serveur.post('/api/auth/login', async () => ({ public: true }));
  serveur.post('/api/auth/refresh', async () => ({ public: true }));
  serveur.post('/api/auth/dev/session', async () => ({ exposed: false }));
  for (const route of routesPriveesRepresentatives) {
    serveur.get(route, async () => ({ protected: false }));
  }
  serveur.get('/api/route-ajoutee-demain', async () => ({ protected: false }));

  return serveur;
}

test('les seules routes publiques de production restent accessibles sans bearer', async () => {
  const serveur = await creerServeurProtege();

  try {
    for (const route of [
      { method: 'GET' as const, url: '/health' },
      { method: 'POST' as const, url: '/api/auth/login' },
      { method: 'POST' as const, url: '/api/auth/refresh' },
    ]) {
      const response = await serveur.inject(route);
      assert.equal(response.statusCode, 200, `${route.method} ${route.url}: ${response.body}`);
    }
  } finally {
    await serveur.close();
  }
});

test('toutes les familles metier et toute route future refusent une requete anonyme', async () => {
  const serveur = await creerServeurProtege();

  try {
    for (const url of [...routesPriveesRepresentatives, '/api/route-ajoutee-demain']) {
      const response = await serveur.inject({ method: 'GET', url });
      assert.equal(response.statusCode, 401, `${url}: ${response.body}`);
      assert.equal(response.json().code, 'AUTHENTICATION_REQUIRED');
    }
  } finally {
    await serveur.close();
  }
});

test('un jeton invalide et la route developpeur en production restent refuses', async () => {
  const serveur = await creerServeurProtege();

  try {
    const invalide = await serveur.inject({
      method: 'GET',
      url: routesPriveesRepresentatives[0],
      headers: { authorization: 'Bearer invalide' },
    });
    assert.equal(invalide.statusCode, 401);
    assert.equal(invalide.json().code, 'AUTHENTICATION_INVALID');

    const dev = await serveur.inject({ method: 'POST', url: '/api/auth/dev/session' });
    assert.equal(dev.statusCode, 401);
    assert.equal(dev.json().code, 'AUTHENTICATION_REQUIRED');
  } finally {
    await serveur.close();
  }
});
