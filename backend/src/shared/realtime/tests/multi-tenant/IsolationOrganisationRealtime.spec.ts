import assert from 'node:assert/strict';
import test from 'node:test';
import { AudienceTempsReel, ContexteTempsReel, PolitiqueIsolationRealtime } from 'shared/realtime';

test('PolitiqueIsolationRealtime refuse une audience cross-organisation', () => {
  const audience = new AudienceTempsReel({
    organisationId: 'org-a',
    ecoleId: 'ecole-a',
    utilisateurIds: ['user-1'],
    permissionsRequises: ['notifications.read'],
  });
  const contexte = new ContexteTempsReel({
    organisationId: 'org-b',
    ecoleId: 'ecole-a',
    permissions: ['notifications.read'],
    emittedAt: new Date().toISOString(),
  });

  assert.equal(new PolitiqueIsolationRealtime().respecter(audience, contexte), false);
});
