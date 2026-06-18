import assert from 'node:assert/strict';
import test from 'node:test';
import { ExecutantRetryNotification } from 'shared/notifications';
import { NotificationsTestSupport } from '../support/NotificationsTestSupport';

test('le moteur de retry execute un job et conserve un historique idempotent exploitable', async () => {
  const environnement = NotificationsTestSupport.creerEnvironnement();
  const executant = new ExecutantRetryNotification(
    environnement.fileRetryNotifications,
    new (require('shared/notifications').RegulateurRetryNotification)(environnement.fileRetryNotifications),
    environnement.adaptateurMonitoringNotification,
  );

  await environnement.fileRetryNotifications.ajouter('notification-retry', {
    correlationId: 'corr-retry',
    requestId: 'req-retry',
    tentative: 1,
    raison: 'provider-down',
  });

  const resultats = await executant.executerCycle();
  const historique = executant.lireHistorique('notification-retry');
  const snapshotMonitoring = await environnement.adaptateurMonitoringNotification.observer();

  assert.equal(resultats.length, 1);
  assert.equal(resultats[0]?.succes, true);
  assert.equal(historique.length, 1);
  assert.equal(historique[0]?.correlationId, 'corr-retry');
  assert.ok(snapshotMonitoring.signauxRecents.some((signal) => signal.nom === 'notifications.retry.executed'));
});
