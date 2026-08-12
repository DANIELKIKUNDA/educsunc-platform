import assert from 'node:assert/strict';
import test from 'node:test';
import { Migration_003_UnifySecurityAudit } from '../../infrastructure/persistence/postgres/Migration_003_UnifySecurityAudit';

test('la migration securite legacy utilise le vocabulaire canonique et conserve la provenance', async () => {
  const requetes: string[] = [];
  const client = {
    query: async (sql: string) => {
      requetes.push(sql);
      if (sql.includes('to_regclass')) return { rows: [{ existe: 'security_audit_events' }] };
      return { rows: [] };
    },
  };

  await new Migration_003_UnifySecurityAudit().executer(client as never);

  const migration = requetes.find((sql) => sql.includes('INSERT INTO audit_entries')) ?? '';
  assert.match(migration, /GOUVERNANCE_SECURITE_MODIFIEE/);
  assert.match(migration, /ACCES_REFUSE/);
  assert.match(migration, /SUCCESS/);
  assert.match(migration, /REFUSED/);
  assert.match(migration, /sourceLegacy/);
  assert.match(migration, /migrationLegacy/);
  assert.doesNotMatch(migration, /'SUCCES'/);
  assert.doesNotMatch(migration, /'ECHEC'/);
  assert.doesNotMatch(migration, /'BACKEND'/);
  assert.equal(requetes.at(-1), 'DROP TABLE security_audit_events');
});

test('la migration securite ne cree rien lorsque le journal legacy est absent', async () => {
  const requetes: string[] = [];
  const client = {
    query: async (sql: string) => {
      requetes.push(sql);
      return { rows: [{ existe: null }] };
    },
  };

  await new Migration_003_UnifySecurityAudit().executer(client as never);

  assert.equal(requetes.length, 1);
});
