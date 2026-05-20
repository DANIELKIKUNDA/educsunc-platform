import test from 'node:test';
import assert from 'node:assert/strict';
import { ErreurContexteTenantIncoherent, PolicyContexteActif } from 'shared/auth/domain';

test('contexte valide accepte', () => {
  assert.doesNotThrow(() => PolicyContexteActif.verifier({ organisationActiveId: 'org-1', ecoleActiveId: 'ecole-1', ecoleAppartientOrganisation: true }));
});

test('contexte incoherent refuse', () => {
  assert.throws(() => PolicyContexteActif.verifier({ ecoleActiveId: 'ecole-1' }), ErreurContexteTenantIncoherent);
  assert.throws(() => PolicyContexteActif.verifier({ organisationActiveId: 'org-1', ecoleActiveId: 'ecole-1', ecoleAppartientOrganisation: false }), ErreurContexteTenantIncoherent);
});
