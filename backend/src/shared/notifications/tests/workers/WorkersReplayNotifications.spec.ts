import assert from 'node:assert/strict';
import test from 'node:test';
import { WorkerReplayNotifications } from 'shared/notifications';
import { NotificationsTestSupport } from '../support/NotificationsTestSupport';

test('le worker racine de replay execute un lot et normalise son type', async () => {
  const environnement = NotificationsTestSupport.creerEnvironnement();
  await environnement.fileReplayNotifications.ajouter('notification-1', {
    correlationId: 'corr-1',
    requestId: 'req-1',
  });

  const resultat = await new WorkerReplayNotifications(
    environnement.workerReplayNotification,
  ).executerCycle();

  assert.equal(resultat.typeWorker, 'REPLAY');
  assert.equal(resultat.totalTraites, 1);
});
