import assert from 'node:assert/strict';
import test from 'node:test';
import { WorkerRecoveryNotifications } from 'shared/notifications';
import { NotificationsTestSupport } from '../support/NotificationsTestSupport';

test('le worker racine de recovery rejoue les dead letters et observe le stockage', async () => {
  const environnement = NotificationsTestSupport.creerEnvironnement();
  await environnement.fileNotifications.ajouter('notification-dead-letter');
  const job = environnement.fileNotifications.extraireProchainDisponible();
  assert.ok(job);
  await environnement.fileDeadLetterNotifications.placer(job, 'incident-technique');

  const worker = new WorkerRecoveryNotifications(environnement.workerRecoveryNotification);
  const resultat = await worker.executerCycle();

  assert.equal(resultat.typeWorker, 'RECOVERY');
  assert.equal(resultat.totalTraites >= 1, true);
  assert.equal(environnement.fileReplayNotifications.extraireProchainDisponible()?.identifiantNotification, 'notification-dead-letter');
});
