import test from 'node:test';
import assert from 'node:assert/strict';
import { TenantMiddleware } from 'shared/auth/interfaces/http/middlewares/TenantMiddleware';
import { TenantContextMiddleware } from 'shared/auth/infrastructure/middlewares/TenantContextMiddleware';
import { TenantContextPortMemoire } from '../support/AuthTestSupport';

test('tenant valide accepte', async () => {
  const middleware = new TenantMiddleware(new TenantContextMiddleware(new TenantContextPortMemoire(true)));
  await assert.doesNotReject(() => middleware.verifier({ 'x-tenant-organisation-id': 'org-1', 'x-tenant-ecole-id': 'ecole-1' }));
});

test('tenant invalide ou ecole hors organisation refuse', async () => {
  const middleware = new TenantMiddleware(new TenantContextMiddleware({
    verifierContexteActif: async () => { throw new Error('tenant invalide'); },
    verifierCoherenceTenant: async () => false,
  }));
  await assert.rejects(() => middleware.verifier({ 'x-tenant-organisation-id': 'org-1', 'x-tenant-ecole-id': 'ecole-2' }));
});
