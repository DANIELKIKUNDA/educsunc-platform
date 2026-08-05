import assert from 'node:assert/strict';
import test from 'node:test';

import {
  HttpRouteAuthenticationPolicy,
  listPublicHttpRoutes,
} from '../security/HttpRouteAuthenticationPolicy';

test('la surface publique de production reste explicite et minimale', () => {
  assert.deepEqual(listPublicHttpRoutes('production'), [
    { method: 'GET', url: '/health' },
    { method: 'GET', url: '/health/live' },
    { method: 'GET', url: '/health/ready' },
    { method: 'GET', url: '/metrics' },
    { method: 'POST', url: '/api/auth/login' },
    { method: 'POST', url: '/api/auth/refresh' },
    { method: 'GET', url: '/api/auth/initialisation' },
    { method: 'POST', url: '/api/auth/initialisation' },
  ]);
});

test('la session developpeur est publique uniquement en environnement development', () => {
  const development = new HttpRouteAuthenticationPolicy('development');
  const production = new HttpRouteAuthenticationPolicy('production');

  assert.equal(development.isPublic({ method: 'POST', url: '/api/auth/dev/session' }), true);
  assert.equal(production.isPublic({ method: 'POST', url: '/api/auth/dev/session' }), false);
  assert.equal(development.isPublic({ method: 'GET', url: '/openapi.json' }), true);
  assert.equal(production.isPublic({ method: 'GET', url: '/openapi.json' }), false);
});

test('une route nouvelle, une mauvaise methode et les routes metier sont privees par defaut', () => {
  const policy = new HttpRouteAuthenticationPolicy('production');

  assert.equal(policy.isPublic({ method: 'GET', url: '/api/nouvelle-route' }), false);
  assert.equal(policy.isPublic({ method: 'GET', url: '/api/auth/login' }), false);
  assert.equal(policy.isPublic({ method: 'GET', url: '/api/v1/configuration/me/theme' }), false);
  assert.equal(policy.isPublic({ method: 'GET', url: '/api/organisations' }), false);
  assert.equal(policy.isPublic({ method: 'GET', url: '/health/details' }), false);
});

test('la comparaison ignore seulement query string et slash terminal', () => {
  const policy = new HttpRouteAuthenticationPolicy('production');

  assert.equal(policy.isPublic({ method: 'GET', url: '/health?probe=basic' }), true);
  assert.equal(policy.isPublic({ method: 'POST', url: '/api/auth/refresh/' }), true);
});
