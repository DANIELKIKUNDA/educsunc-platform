import assert from 'node:assert/strict';
import test from 'node:test';
import Fastify from 'fastify';

import { configurerOpenApi, enregistrerRouteOpenApi } from '../plugins/openapi.plugin';

test('OpenAPI inventorie les routes enregistrees sans s auto-documenter', async () => {
  const serveur = Fastify({ logger: false });
  await configurerOpenApi(serveur, {
    active: true,
    nomApplication: 'EduSync Test',
    versionApplication: '1.2.3',
  });
  serveur.get('/exemple', {
    schema: {
      tags: ['plateforme'],
      response: {
        200: {
          type: 'object',
          properties: { ok: { type: 'boolean' } },
        },
      },
    },
  }, async () => ({ ok: true }));
  await enregistrerRouteOpenApi(serveur, {
    active: true,
    nomApplication: 'EduSync Test',
    versionApplication: '1.2.3',
  });

  try {
    const reponse = await serveur.inject({ method: 'GET', url: '/openapi.json' });
    const document = reponse.json();

    assert.equal(reponse.statusCode, 200);
    assert.equal(document.openapi, '3.1.0');
    assert.equal(document.info.version, '1.2.3');
    assert.ok(document.paths['/exemple']);
    assert.equal(document.paths['/openapi.json'], undefined);
  } finally {
    await serveur.close();
  }
});

test('OpenAPI peut etre desactive en production', async () => {
  const serveur = Fastify({ logger: false });
  await configurerOpenApi(serveur, {
    active: false,
    nomApplication: 'EduSync Test',
    versionApplication: '1.2.3',
  });
  await enregistrerRouteOpenApi(serveur, {
    active: false,
    nomApplication: 'EduSync Test',
    versionApplication: '1.2.3',
  });

  try {
    const reponse = await serveur.inject({ method: 'GET', url: '/openapi.json' });
    assert.equal(reponse.statusCode, 404);
  } finally {
    await serveur.close();
  }
});
