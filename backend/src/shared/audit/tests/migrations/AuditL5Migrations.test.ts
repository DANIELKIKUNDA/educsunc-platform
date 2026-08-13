import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('les migrations L5 restent non destructives et indexees', async () => {
  const source = await readFile(new URL('../../infrastructure/persistence/postgres/MigrateurPostgresAudit.ts', import.meta.url), 'utf8');
  for (const table of ['audit_export_jobs', 'audit_replay_runs', 'audit_integrity_seals', 'audit_retention_runs', 'audit_archive_memberships']) {
    assert.match(source, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`));
  }
  assert.match(source, /version=6/);
  assert.match(source, /version=7/);
  assert.match(source, /audit_export_jobs_dispatch_idx/);
  assert.match(source, /audit_archive_memberships_append_only/);
  assert.doesNotMatch(source, /DROP TABLE\s+audit_entries/i);
  assert.doesNotMatch(source, /DELETE FROM\s+audit_entries/i);
});
