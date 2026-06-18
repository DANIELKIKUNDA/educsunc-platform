import assert from 'node:assert/strict';
import test from 'node:test';
import { NotificationsTempsReelIntegrationOrchestrator } from 'shared/notifications';

test('le pont temps reel futur publie un message logique et expose ses capacites', async () => {
  const orchestrateur = new NotificationsTempsReelIntegrationOrchestrator();

  await orchestrateur.publier({
    sujet: 'notifications.realtime.test',
    typeEvenement: 'NOTIFICATION_DIFFUSEE',
    notificationId: 'notification-realtime',
    organisationId: 'org-realtime',
    correlationId: 'corr-realtime',
    requestId: 'req-realtime',
    donnees: {
      notificationId: 'notification-realtime',
      organisationId: 'org-realtime',
      correlationId: 'corr-realtime',
      requestId: 'req-realtime',
    },
  });

  const snapshot = orchestrateur.obtenirSnapshot();
  assert.equal(snapshot.dernieresPublications.length, 1);
  assert.equal(snapshot.derniersMessagesTechniques.length, 1);
  assert.equal(snapshot.capabilities.publicationActive, true);
});
