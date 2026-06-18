import assert from 'node:assert/strict';
import test from 'node:test';
import { NotificationsTempsReelIntegrationOrchestrator } from 'shared/notifications';

test('le pont temps reel publie une demande et expose ses capacites futures', async () => {
  const orchestrateur = new NotificationsTempsReelIntegrationOrchestrator();

  await orchestrateur.publier({
    sujet: 'notifications.events',
    typeEvenement: 'NOTIFICATION_CREEE',
    notificationId: 'notification-1',
    organisationId: 'org-1',
    ecoleId: 'ecole-1',
    correlationId: 'corr-1',
    requestId: 'req-1',
    donnees: {
      type: 'INFORMATION_GENERALE',
    },
  });

  const snapshot = orchestrateur.obtenirSnapshot();
  assert.equal(snapshot.capabilities.publicationActive, true);
  assert.equal(snapshot.derniersMessagesTechniques.length, 1);
  assert.equal(snapshot.dernieresPublications.length, 1);
});
