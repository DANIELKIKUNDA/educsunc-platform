import test from 'node:test';
import assert from 'node:assert/strict';
import { ErreurEcoleNonAutorisee, PolicyScopeEcole } from 'shared/security/domain';

test('scope ecole valide accepte et ecole etrangere refusee', () => {
  PolicyScopeEcole.verifier(['ecole-1'], 'ecole-1');
  assert.throws(() => PolicyScopeEcole.verifier(['ecole-1'], 'ecole-2'), ErreurEcoleNonAutorisee);
});
