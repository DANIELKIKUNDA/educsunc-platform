import assert from 'node:assert/strict';
import test from 'node:test';
import { SecurityTenantIsolationService } from 'shared/security/infrastructure';

test('la politique runtime de type RLS refuse les acces cross-tenant', () => {
  const service = new SecurityTenantIsolationService();
  service.verifierOrganisation('org-a', 'org-a');
  service.verifierEcole('ecole-a-1', 'ecole-a-1');
  assert.throws(() => service.verifierOrganisation('org-b', 'org-a'));
  assert.throws(() => service.verifierEcole('ecole-b-1', 'ecole-a-1'));
});
