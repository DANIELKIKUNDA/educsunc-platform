import assert from 'node:assert/strict';
import test from 'node:test';
import Fastify from 'fastify';

import { creerRouteHealth, type VerificateurDisponibilite } from '../routes/health.routes';

async function creerServeur(disponible: boolean) {
  const verificateur: VerificateurDisponibilite = {
    async verifier() {
      return { disponible, latenceMs: 12.345 };
    },
  };
  const serveur = Fastify({ logger: false });
  await serveur.register(creerRouteHealth(verificateur));
  return serveur;
}

test('les probes de vivacite conservent un contrat stable', async () => {
  const serveur = await creerServeur(true);

  try {
    for (const url of ['/health', '/health/live']) {
      const reponse = await serveur.inject({ method: 'GET', url });
      assert.equal(reponse.statusCode, 200);
      assert.equal(reponse.json().status, 'ok');
      assert.equal(typeof reponse.json().version, 'string');
    }
  } finally {
    await serveur.close();
  }
});

test('la disponibilite confirme PostgreSQL sans exposer de detail technique', async () => {
  const serveur = await creerServeur(true);

  try {
    const reponse = await serveur.inject({ method: 'GET', url: '/health/ready' });
    assert.equal(reponse.statusCode, 200);
    assert.equal(reponse.json().readiness, 'ready');
    assert.deepEqual(reponse.json().dependencies.postgres, {
      status: 'up',
      latencyMs: 12.35,
    });
  } finally {
    await serveur.close();
  }
});

test('la disponibilite renvoie 503 lorsque PostgreSQL est indisponible', async () => {
  const serveur = await creerServeur(false);

  try {
    const reponse = await serveur.inject({ method: 'GET', url: '/health/ready' });
    assert.equal(reponse.statusCode, 503);
    assert.equal(reponse.json().readiness, 'not_ready');
    assert.equal(reponse.json().dependencies.postgres.status, 'down');
  } finally {
    await serveur.close();
  }
});
