import assert from 'node:assert/strict';
import test from 'node:test';
import { RealtimeCommandFactory } from '../factories/RealtimeCommandFactory';
import { RealtimeRuntimeFactory } from '../factories/RealtimeRuntimeFactory';

test('RuntimeDiffusionRealtime relaie une diffusion et alimente l observabilite', async () => {
  const runtime = RealtimeRuntimeFactory.creer();

  await runtime.broadcast.diffusion.diffuser(RealtimeCommandFactory.publication());

  const journal = runtime.facade.registre.diffusion.lireJournal();
  const observabilite = runtime.observability.service.lire();

  assert.equal(journal.length, 1);
  assert.equal(observabilite.signaux.length, 1);
});
