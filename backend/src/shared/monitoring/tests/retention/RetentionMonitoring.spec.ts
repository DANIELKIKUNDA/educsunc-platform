import assert from 'node:assert/strict';
import test from 'node:test';
import { chargerPolitiqueRetentionMonitoring, ServiceRetentionMonitoringPostgres } from '../../infrastructure';

test('M10 n invente aucune duree de retention diagnostics/traces', () => {
  assert.deepEqual(chargerPolitiqueRetentionMonitoring({}), { diagnosticsJours: null, tracesJours: null });
});

test('M10 refuse les durees invalides', () => {
  assert.throws(() => chargerPolitiqueRetentionMonitoring({ MONITORING_RETENTION_TRACES_DAYS: '0' }));
  assert.throws(() => chargerPolitiqueRetentionMonitoring({ MONITORING_RETENTION_DIAGNOSTICS_DAYS: 'abc' }));
});

test('M10 ne purge rien lorsque la politique est absente', async () => {
  const requetes: string[] = [];
  const client = {
    query: async (sql: string) => { requetes.push(sql); return { rowCount: 0 }; },
    release: () => undefined,
  };
  const pool = { connect: async () => client } as any;
  const rapport = await new ServiceRetentionMonitoringPostgres(pool, { diagnosticsJours: null, tracesJours: null }).executer(new Date('2026-08-12T00:00:00Z'));
  assert.equal(rapport.diagnostics.supprimes, 0);
  assert.equal(rapport.traces.supprimes, 0);
  assert.equal(requetes.some((sql) => sql.includes('DELETE FROM')), false);
  assert.deepEqual(requetes, ['BEGIN', 'COMMIT']);
});

test('M10 purge uniquement diagnostics et traces avec transaction et rapport', async () => {
  const requetes: string[] = [];
  const client = {
    query: async (sql: string) => {
      requetes.push(sql);
      if (sql.includes('monitoring_diagnostics')) return { rowCount: 3 };
      if (sql.includes('monitoring_traces')) return { rowCount: 5 };
      return { rowCount: 0 };
    },
    release: () => undefined,
  };
  const pool = { connect: async () => client } as any;
  const rapport = await new ServiceRetentionMonitoringPostgres(pool, { diagnosticsJours: 30, tracesJours: 7 }).executer(new Date('2026-08-12T00:00:00Z'));
  assert.equal(rapport.diagnostics.supprimes, 3);
  assert.equal(rapport.traces.supprimes, 5);
  assert.equal(requetes.some((sql) => sql.includes('monitoring_alertes')), false);
  assert.equal(requetes.some((sql) => sql.includes('monitoring_incidents')), false);
  assert.equal(requetes.at(-1), 'COMMIT');
});
