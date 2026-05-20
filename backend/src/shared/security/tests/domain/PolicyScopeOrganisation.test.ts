import test from 'node:test';
import assert from 'node:assert/strict';
import { ErreurOrganisationNonAutorisee, PolicyScopeOrganisation } from 'shared/security/domain';

test('scope organisation valide accepte et organisation etrangere refusee', () => {
  PolicyScopeOrganisation.verifier(['org-1'], 'org-1');
  assert.throws(() => PolicyScopeOrganisation.verifier(['org-1'], 'org-2'), ErreurOrganisationNonAutorisee);
});
