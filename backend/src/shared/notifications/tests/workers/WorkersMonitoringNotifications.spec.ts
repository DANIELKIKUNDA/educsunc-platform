import assert from 'node:assert/strict';
import test from 'node:test';
import { WorkerMonitoringNotifications } from 'shared/notifications';
import { NotificationsTestSupport } from '../support/NotificationsTestSupport';

test('le worker monitoring consolide signaux files et providers', async () => {
  const environnement = NotificationsTestSupport.creerEnvironnement();
  await environnement.adaptateurMonitoringNotification.enregistrerSignal('notifications.signal.test', {
    valeur: 1,
  });
  await environnement.fileNotifications.ajouter('notification-monitoring-worker');

  const worker = new WorkerMonitoringNotifications(environnement.adaptateurMonitoringNotification);
  const resultat = await worker.executerCycle();
  const metadataQueues = resultat.details[1]?.metadata as { totalDispatch?: number };
  const metadataProviders = resultat.details[2]?.metadata as { totalProviders?: number };

  assert.equal(resultat.typeWorker, 'MONITORING');
  assert.equal(resultat.totalTraites, 3);
  assert.equal(resultat.details[0]?.metadata.total, 1);
  assert.equal(metadataQueues.totalDispatch, 1);
  assert.equal((metadataProviders.totalProviders ?? 0) >= 2, true);
});
