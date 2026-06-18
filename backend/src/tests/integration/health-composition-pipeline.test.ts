import assert from 'node:assert/strict';
import test from 'node:test';
import Fastify from 'fastify';
import { requestContextPlugin } from '../../app/plugins/request-context.plugin';
import { routeHealth } from '../../app/routes/health.routes';

test('la composition globale minimale garde /health accessible et initialise le RequestContext', async () => {
  const serveur = Fastify();

  await serveur.register(async (instance) => {
    await requestContextPlugin(instance, {});
    await instance.register(routeHealth);
  });

  const reponse = await serveur.inject({
    method: 'GET',
    url: '/health',
    headers: {
      'x-correlation-id': 'corr-health-global',
      'x-device-id': 'device-health-1',
    },
  });

  assert.equal(reponse.statusCode, 200, reponse.body);
  const corps = reponse.json() as {
    status: string;
    service: string;
    timestamp: string;
  };

  assert.equal(corps.status, 'ok');
  assert.ok(corps.service.length > 0);
  assert.ok(corps.timestamp.length > 0);

  await serveur.close();
});
