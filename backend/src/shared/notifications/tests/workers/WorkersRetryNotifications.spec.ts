import assert from 'node:assert/strict';
import test from 'node:test';
import { WorkerRetryNotifications } from 'shared/notifications';
import { NotificationsTestSupport } from '../support/NotificationsTestSupport';

test('le worker racine de retry execute un lot et normalise son type', async () => {
  const environnement = NotificationsTestSupport.creerEnvironnement();
  await environnement.fileRetryNotifications.ajouter('notification-1', {
    tentative: 1,
    delaiRetryMs: 0,
  });

  const resultat = await new WorkerRetryNotifications(
    environnement.workerRetryNotification,
  ).executerCycle();

  assert.equal(resultat.typeWorker, 'RETRY');
  assert.equal(resultat.totalTraites, 1);
});
