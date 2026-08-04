import assert from 'node:assert/strict';
import test from 'node:test';
import Fastify from 'fastify';
import {
  configurerCorsFrontend,
  entetesCorsFrontend,
  methodesCorsFrontend,
} from '../plugins/http-security.plugin';

test('le prevol CORS autorise toutes les mutations utilisees par le frontend', async () => {
  const serveur = Fastify();
  await configurerCorsFrontend(serveur, { environnement: 'development' });

  try {
    const reponse = await serveur.inject({
      method: 'OPTIONS',
      url: '/api/v1/configuration/configuration-test',
      headers: {
        origin: 'http://127.0.0.1:4174',
        'access-control-request-method': 'PUT',
        'access-control-request-headers': [
          'content-type',
          'idempotency-key',
          'x-user-id',
          'x-session-id',
          'x-role-actif',
          'x-organisation-id',
        ].join(','),
      },
    });

    assert.equal(reponse.statusCode, 204);
    assert.equal(reponse.headers['access-control-allow-origin'], 'http://127.0.0.1:4174');
    assert.equal(reponse.headers['access-control-allow-credentials'], 'true');
    assert.equal(reponse.headers['access-control-allow-methods'], methodesCorsFrontend.join(', '));
    assert.equal(reponse.headers['access-control-allow-headers'], entetesCorsFrontend.join(', '));
    assert.ok(methodesCorsFrontend.includes('PUT'));
    assert.ok(entetesCorsFrontend.includes('Idempotency-Key'));
  } finally {
    await serveur.close();
  }
});

test('une origine inconnue ne recoit aucun droit CORS', async () => {
  const serveur = Fastify();
  await configurerCorsFrontend(serveur, { environnement: 'development' });
  serveur.get('/probe', async () => ({ ok: true }));

  try {
    const reponse = await serveur.inject({
      method: 'GET',
      url: '/probe',
      headers: { origin: 'https://origine-inconnue.example' },
    });

    assert.equal(reponse.statusCode, 200);
    assert.equal(reponse.headers['access-control-allow-origin'], undefined);
  } finally {
    await serveur.close();
  }
});

test('la production autorise uniquement les origines explicitement declarees', async () => {
  const serveur = Fastify();
  await configurerCorsFrontend(serveur, {
    environnement: 'production',
    originesSupplementaires: 'https://app.edusync.cd',
  });
  serveur.get('/probe', async () => ({ ok: true }));

  try {
    const locale = await serveur.inject({
      method: 'GET',
      url: '/probe',
      headers: { origin: 'http://localhost:4174' },
    });
    const officielle = await serveur.inject({
      method: 'GET',
      url: '/probe',
      headers: { origin: 'https://app.edusync.cd' },
    });

    assert.equal(locale.headers['access-control-allow-origin'], undefined);
    assert.equal(officielle.headers['access-control-allow-origin'], 'https://app.edusync.cd');
  } finally {
    await serveur.close();
  }
});
