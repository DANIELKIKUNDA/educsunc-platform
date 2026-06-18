import assert from 'node:assert/strict';
import test from 'node:test';
import { WorkerRetryNotifications } from 'shared/notifications';
import { NotificationsTestSupport } from '../support/NotificationsTestSupport';

test('un job retry deja consomme ne se reexecute pas au cycle suivant', async () => {
  const environnement = NotificationsTestSupport.creerEnvironnement();
  await environnement.fileRetryNotifications.ajouter('notification-1', {
    tentative: 0,
    delaiRetryMs: 0,
  });
  const worker = new WorkerRetryNotifications(environnement.workerRetryNotification);

  const premierCycle = await worker.executerCycle();
  const secondCycle = await worker.executerCycle();

  assert.equal(premierCycle.totalTraites, 1);
  assert.equal(secondCycle.totalTraites, 0);
});
