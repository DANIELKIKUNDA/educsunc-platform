import test from 'node:test';
import assert from 'node:assert/strict';
import { AuditAuthApplicationService } from 'shared/auth/application/services/AuditAuthApplicationService';
import { SecurityAuditPortMemoire } from '../support/AuthTestSupport';

test('audit login, logout, revocation et auth offline', async () => {
  const port = new SecurityAuditPortMemoire();
  const service = new AuditAuthApplicationService(port);
  await service.journaliserConnexion({ utilisateurId: 'u1', sessionId: 's1', estOffline: false });
  await service.publierAuditSecurite({ action: 'AUTH_LOGOUT', utilisateurId: 'u1', succes: true });
  await service.publierAuditSecurite({ action: 'AUTH_OFFLINE_PREPAREE', utilisateurId: 'u1', succes: true });
  assert.equal(port.connexions.length, 1);
  assert.equal(port.audits.length, 2);
});
