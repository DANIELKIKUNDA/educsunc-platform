import assert from 'node:assert/strict';
import test from 'node:test';
import Fastify from 'fastify';

import { configurerSocleHttp } from '../plugins/http-security.plugin';

async function creerServeurHttp() {
  const serveur = Fastify({ logger: false });
  await configurerSocleHttp(serveur, { environnement: 'test' });
  serveur.get('/ok', async () => ({ ok: true }));
  serveur.get('/erreur', async () => {
    throw new Error('detail-interne-confidentiel');
  });
  return serveur;
}

test('le socle HTTP ajoute les entetes de securite sans casser les reponses JSON', async () => {
  const serveur = await creerServeurHttp();

  try {
    const reponse = await serveur.inject({ method: 'GET', url: '/ok' });

    assert.equal(reponse.statusCode, 200);
    assert.equal(reponse.headers['x-content-type-options'], 'nosniff');
    assert.equal(reponse.headers['x-frame-options'], 'SAMEORIGIN');
    assert.equal(reponse.headers['cross-origin-resource-policy'], 'cross-origin');
    assert.deepEqual(reponse.json(), { ok: true });
  } finally {
    await serveur.close();
  }
});

test('une erreur interne est journalisee mais jamais exposee au client', async () => {
  const serveur = await creerServeurHttp();

  try {
    const reponse = await serveur.inject({ method: 'GET', url: '/erreur' });

    assert.equal(reponse.statusCode, 500);
    assert.equal(reponse.json().code, 'ERREUR_INTERNE');
    assert.doesNotMatch(reponse.body, /detail-interne-confidentiel/u);
  } finally {
    await serveur.close();
  }
});

test('une route absente renvoie un contrat public stable', async () => {
  const serveur = await creerServeurHttp();

  try {
    const reponse = await serveur.inject({ method: 'GET', url: '/absente' });

    assert.equal(reponse.statusCode, 404);
    assert.deepEqual(reponse.json(), {
      success: false,
      code: 'ROUTE_INTROUVABLE',
      message: 'La ressource demandee est introuvable.',
    });
  } finally {
    await serveur.close();
  }
});
