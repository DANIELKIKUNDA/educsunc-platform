import assert from 'node:assert/strict';
import test from 'node:test';
import type { Pool } from 'pg';
import type { ClientRedisShared } from '../../../infrastructure/redis';
import { CollecteurEtatDependancesMonitoring, CollecteurEtatRuntimeMonitoring } from '../../infrastructure';

const contexte = { utilisateurId: 'system-resilience-test' };

test('M8: PostgreSQL DOWN produit CRITICAL sans propager la panne', async () => {
  const pool = { query: async () => { throw new Error('connection refused'); }, totalCount: 0, idleCount: 0, waitingCount: 0 } as unknown as Pool;
  const [etat] = await new CollecteurEtatDependancesMonitoring(pool).collecter(contexte);
  assert.equal(etat.valeur().niveau, 'CRITICAL');
  assert.equal(etat.valeur().disponible, false);
});

test('M8: timeout PostgreSQL est borne et retourne CRITICAL', async () => {
  const pool = { query: async () => new Promise(() => { /* simule une requete bloquee */ }), totalCount: 1, idleCount: 0, waitingCount: 1 } as unknown as Pool;
  const debut = Date.now();
  const [etat] = await new CollecteurEtatDependancesMonitoring(pool, undefined, 20).collecter(contexte);
  assert.equal(etat.valeur().niveau, 'CRITICAL');
  assert.match(etat.valeur().message, /timeout/i);
  assert.ok(Date.now() - debut < 500, 'la sonde doit rester bornee');
});

test('M8: Redis DOWN produit CRITICAL sans faire echouer la collecte globale', async () => {
  const redis = { connecter: async () => { throw new Error('redis down'); }, observerEtat: () => ({ modeSimulation: false }), ping: async () => 'PONG' } as unknown as ClientRedisShared;
  const dependances = await new CollecteurEtatDependancesMonitoring(undefined, redis, 20).collecter(contexte);
  const etat = dependances.find((d) => d.valeur().nom === 'redis')!.valeur();
  assert.equal(etat.niveau, 'CRITICAL');
  assert.equal(etat.disponible, false);
});

test('M8: BullMQ non raccorde reste UNKNOWN, jamais HEALTHY', async () => {
  const etat = await new CollecteurEtatRuntimeMonitoring(undefined).collecter(contexte);
  assert.equal(etat.valeur().niveau, 'UNKNOWN');
});

test('M8: worker mort avec backlog est DEGRADED', () => {
  const etat = CollecteurEtatRuntimeMonitoring.evaluerSnapshots([{ nom: 'q', counts: { waiting: 5, active: 0, completed: 0, failed: 0, delayed: 0 }, workers: 0 }]);
  assert.equal(etat.valeur().niveau, 'DEGRADED');
  assert.equal(etat.valeur().jobsEnRetard, 5);
});

test('M8: failed jobs degradent le runtime meme avec worker actif', () => {
  const etat = CollecteurEtatRuntimeMonitoring.evaluerSnapshots([{ nom: 'q', counts: { waiting: 0, active: 0, completed: 10, failed: 2, delayed: 0 }, workers: 1 }]);
  assert.equal(etat.valeur().niveau, 'DEGRADED');
});
