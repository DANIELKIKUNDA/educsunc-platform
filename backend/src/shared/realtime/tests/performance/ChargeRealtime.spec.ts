import assert from 'node:assert/strict';
import test from 'node:test';
import { RealtimeCommandFactory } from '../factories/RealtimeCommandFactory';
import { RealtimeRuntimeFactory } from '../factories/RealtimeRuntimeFactory';

test('le runtime Realtime absorbe une charge locale courte et journalise tous les messages', async () => {
  const runtime = RealtimeRuntimeFactory.creer();
  const signauxAvant = runtime.facade.registre.observabilite.lireSignaux().length;
  const tailleCharge = 25;

  for (let index = 0; index < tailleCharge; index += 1) {
    await runtime.broadcast.diffusion.diffuser(
      RealtimeCommandFactory.publication({
        evenementId: `evt-charge-${index}`,
        payload: { titre: `notification-${index}` },
      }),
    );
  }

  const journal = runtime.facade.registre.diffusion.lireJournal();
  const signauxApres = runtime.facade.registre.observabilite.lireSignaux().length;
  const diagnostics = runtime.observability.diagnostics.lire();

  assert.equal(journal.length, tailleCharge);
  assert.equal(signauxApres - signauxAvant, tailleCharge);
  assert.equal(diagnostics.totalMessagesJournalises, tailleCharge);
});
