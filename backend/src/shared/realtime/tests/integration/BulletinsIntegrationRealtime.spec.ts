import assert from 'node:assert/strict';
import test from 'node:test';
import { RealtimeBulletinsIntegrationOrchestrator } from 'shared/realtime';

test('RealtimeBulletinsIntegrationOrchestrator relaie un evenement metier vers realtime', async () => {
  const orchestrateur = new RealtimeBulletinsIntegrationOrchestrator();

  await orchestrateur.publier({
    type: 'BulletinPublie',
    audience: ['user-bul-1'],
    organisationId: 'org-bul',
    ecoleId: 'ecole-bul',
    payload: { bulletinId: 'bulletin-1' },
  });

  const snapshot = orchestrateur.snapshot();
  assert.equal(snapshot.totalMessages >= 1, true);
  assert.equal(snapshot.messages.at(-1)?.type, 'BulletinPublie');
});
