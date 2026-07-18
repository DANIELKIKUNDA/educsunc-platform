import test from 'node:test';
import assert from 'node:assert/strict';
import { MemoireSecurityAuditTestService, obtenirAuditLogsSecurity, obtenirAuditRefusSecurity, reinitialiserMemoireSecurity } from '../support/SecurityTestSupport';

test('audit acces, audit refus et changements de securite sont traces', async () => {
  reinitialiserMemoireSecurity();
  const audit = new MemoireSecurityAuditTestService();
  await audit.journaliser({ action: 'ACCESS_GRANTED', idUtilisateur: 'u1', succes: true });
  await audit.journaliser({ action: 'ACCESS_DENIED', idUtilisateur: 'u1', succes: false });

  assert.equal(obtenirAuditLogsSecurity().length, 2);
  assert.equal(obtenirAuditRefusSecurity().length, 1);
});
