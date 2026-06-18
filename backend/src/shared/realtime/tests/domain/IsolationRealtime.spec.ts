import assert from 'node:assert/strict';
import test from 'node:test';
import { AudienceTempsReel, ContexteTempsReel, PolitiqueIsolationRealtime } from 'shared/realtime';

test('PolitiqueIsolationRealtime refuse une audience cross-ecole', () => {
  const audience = new AudienceTempsReel({
    organisationId: 'org-1',
    ecoleId: 'ecole-a',
    utilisateurIds: ['user-1'],
    permissionsRequises: ['notifications.read'],
  });
  const contexte = new ContexteTempsReel({
    organisationId: 'org-1',
    ecoleId: 'ecole-b',
    permissions: ['notifications.read'],
    emittedAt: new Date().toISOString(),
  });
  assert.equal(new PolitiqueIsolationRealtime().respecter(audience, contexte), false);
});
