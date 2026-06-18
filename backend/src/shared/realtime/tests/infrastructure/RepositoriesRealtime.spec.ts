import assert from 'node:assert/strict';
import test from 'node:test';
import { RepositoryEvenementRealtimeMemoire } from 'shared/realtime';
import { RealtimeFactory } from '../factories/RealtimeFactory';

test('RepositoryEvenementRealtimeMemoire relit les evenements diffusables', async () => {
  const repository = new RepositoryEvenementRealtimeMemoire();
  await repository.sauvegarder(RealtimeFactory.evenement());
  const resultat = await repository.listerDiffusables();
  assert.ok(resultat.length >= 1);
});
