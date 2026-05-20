import test from 'node:test';
import assert from 'node:assert/strict';
import { SecurityAuditInfrastructureService } from 'shared/security/infrastructure';
import { obtenirAuditLogsSecurity, obtenirAuditRefusSecurity, reinitialiserMemoireSecurity } from '../support/SecurityTestSupport';

test('audit acces accorde, audit acces refuse et audit changements securite', async () => {
  reinitialiserMemoireSecurity();
  const service = new SecurityAuditInfrastructureService();
  await service.journaliser({ action: 'ROLE_CREATED', idUtilisateur: 'u1', succes: true });
  await service.journaliser({ action: 'PERMISSION_DENIED', idUtilisateur: 'u1', succes: false });

  assert.equal(obtenirAuditLogsSecurity().length, 2);
  assert.equal(obtenirAuditRefusSecurity().length, 1);
});
