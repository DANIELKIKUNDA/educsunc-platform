import assert from 'node:assert/strict';
import test from 'node:test';
import { NotificationsSecurityIntegrationOrchestrator } from 'shared/notifications';

test('le pont security trace un refus et expose son snapshot local', async () => {
  const orchestrateur = new NotificationsSecurityIntegrationOrchestrator();
  orchestrateur.synchroniserContexteActif({
    idOrganisationActive: 'org-1',
    idEcoleActive: 'ecole-1',
  } as never);

  const verification = await orchestrateur.verifierDecision({
    action: 'notifications.admin.dead-letter',
    scopes: ['notifications.admin.dead-letter'],
    contexteNotification: {
      notificationId: 'notification-1',
      canal: 'IN_APP',
      organisationId: 'org-2',
      ecoleId: 'ecole-1',
      requestedAt: new Date().toISOString(),
    },
    metadata: {},
  });

  orchestrateur.enregistrerDecision(verification.decision, {
    notificationId: 'notification-1',
    canal: 'IN_APP',
    organisationId: 'org-2',
    ecoleId: 'ecole-1',
    requestedAt: new Date().toISOString(),
  });

  const snapshot = orchestrateur.obtenirSnapshot();
  assert.equal(verification.decision.autorise, false);
  assert.equal(snapshot.totalRefus, 1);
  assert.equal(snapshot.totalAnomalies, 1);
});
