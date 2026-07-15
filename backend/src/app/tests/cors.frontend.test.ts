import assert from 'node:assert/strict';
import test from 'node:test';
import Fastify from 'fastify';
import {
  configurerCorsFrontend,
  entetesCorsFrontend,
  methodesCorsFrontend,
} from '../serveur';

test('le prevol CORS autorise toutes les mutations utilisees par le frontend', async () => {
  const serveur = Fastify();
  configurerCorsFrontend(serveur);

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
    assert.equal(reponse.headers['access-control-allow-methods'], methodesCorsFrontend);
    assert.equal(reponse.headers['access-control-allow-headers'], entetesCorsFrontend);
    assert.match(methodesCorsFrontend, /(?:^|,)PUT(?:,|$)/);
    assert.match(entetesCorsFrontend.toLowerCase(), /(?:^|,)idempotency-key(?:,|$)/);
  } finally {
    await serveur.close();
  }
});
