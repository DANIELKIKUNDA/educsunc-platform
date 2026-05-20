import test from 'node:test';
import assert from 'node:assert/strict';
import { SecurityTenantAdapter } from 'shared/security/infrastructure';
import { ContexteTenant } from 'shared/tenancy/TenantContext';

test('isolation organisation, ecole et coherence de contexte actif', async () => {
  const contexte = new ContexteTenant();
  contexte.definirTenant('ecole-1');
  contexte.definirOrganisation('org-1');
  const adapter = new SecurityTenantAdapter(contexte);

  assert.equal(await adapter.verifierOrganisation('org-1'), true);
  assert.equal(await adapter.verifierEcole('ecole-1'), true);
  assert.equal(await adapter.verifierAppartenanceEcoleOrganisation('ecole-1', 'org-1'), true);
});
