import assert from 'node:assert/strict';
import test from 'node:test';
import { WorkerReplayNotifications } from 'shared/notifications';
import { NotificationsTestSupport } from '../support/NotificationsTestSupport';

test('un job replay deja consomme ne se rejoue pas deux fois', async () => {
  const environnement = NotificationsTestSupport.creerEnvironnement();
  await environnement.fileReplayNotifications.ajouter('notification-1', {
    correlationId: 'corr-1',
  });
  const worker = new WorkerReplayNotifications(environnement.workerReplayNotification);

  const premierCycle = await worker.executerCycle();
  const secondCycle = await worker.executerCycle();

  assert.equal(premierCycle.totalTraites, 1);
  assert.equal(secondCycle.totalTraites, 0);
});
