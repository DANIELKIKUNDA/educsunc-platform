import assert from 'node:assert/strict';
import test from 'node:test';
import Fastify from 'fastify';

import { configurerObservabiliteHttp } from '../plugins/observabilite-http.plugin';

test('Prometheus expose les metriques runtime et HTTP sans identifiant dynamique', async () => {
  const serveur = Fastify({ logger: false });
  await configurerObservabiliteHttp(serveur, {
    activerMetriques: true,
    environnement: 'test',
  });
  serveur.get('/eleves/:id', async () => ({ ok: true }));

  try {
    await serveur.inject({ method: 'GET', url: '/eleves/eleve-confidentiel' });
    const reponse = await serveur.inject({ method: 'GET', url: '/metrics' });

    assert.equal(reponse.statusCode, 200);
    assert.match(reponse.headers['content-type'] ?? '', /text\/plain/u);
    assert.match(reponse.body, /edusync_process_cpu_user_seconds_total/u);
    assert.match(reponse.body, /edusync_http_requests_total/u);
    assert.match(reponse.body, /route="\/eleves\/:id"/u);
    assert.doesNotMatch(reponse.body, /eleve-confidentiel/u);
  } finally {
    await serveur.close();
  }
});

test('Prometheus exige le jeton de supervision configure', async () => {
  const serveur = Fastify({ logger: false });
  await configurerObservabiliteHttp(serveur, {
    activerMetriques: true,
    environnement: 'production',
    jetonMetriques: 'jeton-supervision-test',
  });

  try {
    const refusee = await serveur.inject({ method: 'GET', url: '/metrics' });
    const autorisee = await serveur.inject({
      method: 'GET',
      url: '/metrics',
      headers: { authorization: 'Bearer jeton-supervision-test' },
    });

    assert.equal(refusee.statusCode, 401);
    assert.equal(refusee.json().code, 'METRICS_AUTH_REQUIRED');
    assert.equal(autorisee.statusCode, 200);
  } finally {
    await serveur.close();
  }
});

test('les metriques de production refusent de demarrer sans jeton', async () => {
  const serveur = Fastify({ logger: false });

  await assert.rejects(
    configurerObservabiliteHttp(serveur, {
      activerMetriques: true,
      environnement: 'production',
    }),
    /EDUCSYN_METRICS_TOKEN/u,
  );
  await serveur.close();
});

test('les metriques peuvent etre desactivees sans laisser de route', async () => {
  const serveur = Fastify({ logger: false });
  await configurerObservabiliteHttp(serveur, {
    activerMetriques: false,
    environnement: 'test',
  });

  try {
    const reponse = await serveur.inject({ method: 'GET', url: '/metrics' });
    assert.equal(reponse.statusCode, 404);
  } finally {
    await serveur.close();
  }
});
