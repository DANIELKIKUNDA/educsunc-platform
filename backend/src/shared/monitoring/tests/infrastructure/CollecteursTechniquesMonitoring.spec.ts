import assert from 'node:assert/strict';
import test from 'node:test';
import type { Pool } from 'pg';
import type { ClientRedisShared, ConfigurationConnexionRedisShared } from '../../../infrastructure/redis';
import {
  CollecteurEtatDependancesMonitoring,
  CollecteurEtatRuntimeMonitoring,
  CollecteurMetriquesTechniquesMonitoring,
} from '../../infrastructure';

const contexte = { utilisateurId: 'system-test' };

test('M3: PostgreSQL reel expose SELECT 1, latence et pool sans etat fictif', async () => {
  const pool = {
    query: async () => ({ rows: [{ monitoring_health: 1 }] }),
    totalCount: 4,
    idleCount: 3,
    waitingCount: 0,
  } as unknown as Pool;
  const collecteur = new CollecteurEtatDependancesMonitoring(pool, undefined);
  const [postgres] = await collecteur.collecter(contexte);
  const valeur = postgres.valeur();
  assert.equal(valeur.nom, 'postgresql');
  assert.equal(valeur.disponible, true);
  assert.match(valeur.message, /SELECT 1 OK/);
  assert.match(valeur.message, /pool total=4 idle=3 waiting=0/);
});

test('M3: Redis simule est DEGRADED et jamais HEALTHY', async () => {
  const redis = {
    connecter: async () => undefined,
    observerEtat: () => ({ modeSimulation: true }),
    ping: async () => 'PONG' as const,
  } as unknown as ClientRedisShared;
  const collecteur = new CollecteurEtatDependancesMonitoring(undefined, redis);
  const dependances = await collecteur.collecter(contexte);
  const redisEtat = dependances.find((d) => d.valeur().nom === 'redis')?.valeur();
  assert.equal(redisEtat?.niveau, 'DEGRADED');
  assert.equal(redisEtat?.disponible, false);
});

test('M3: runtime BullMQ en simulation est DEGRADED sans queues/workers fictifs', async () => {
  const configuration: ConfigurationConnexionRedisShared = {
    modeConnexion: 'simulation', host: '127.0.0.1', port: 6379, database: 0,
    tlsActive: false, prefixCle: 'test', timeoutConnexionMs: 100, timeoutInactiviteMs: 100,
  };
  const runtime = await new CollecteurEtatRuntimeMonitoring(configuration).collecter(contexte);
  const valeur = runtime.valeur();
  assert.equal(valeur.niveau, 'DEGRADED');
  assert.deepEqual(valeur.filesActives, []);
  assert.deepEqual(valeur.workersActifs, []);
});

test('M3: metriques Node exposent memoire, CPU, max RSS et event-loop reels', async () => {
  const metriques = await new CollecteurMetriquesTechniquesMonitoring().collecter(contexte);
  const noms = new Set(metriques.map((m) => m.valeur().nom));
  for (const nom of [
    'process_uptime_seconds', 'process_rss_bytes', 'process_heap_used_bytes',
    'process_heap_total_bytes', 'process_external_memory_bytes', 'process_array_buffers_bytes',
    'process_cpu_user_microseconds', 'process_cpu_system_microseconds', 'process_max_rss_bytes',
    'node_event_loop_utilization_ratio',
  ]) assert.ok(noms.has(nom), `metrique absente: ${nom}`);
});
