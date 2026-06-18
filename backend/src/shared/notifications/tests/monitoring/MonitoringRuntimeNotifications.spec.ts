import assert from 'node:assert/strict';
import test from 'node:test';
import { NotificationsTestSupport } from '../support/NotificationsTestSupport';

test('le runtime de monitoring expose les signaux, les files et les providers', async () => {
  const environnement = NotificationsTestSupport.creerEnvironnement();
  await environnement.adaptateurMonitoringNotification.enregistrerSignal('notifications.test.signal', {
    valeur: 1,
  });
  await environnement.fileNotifications.ajouter('notification-monitoring');

  const runtime = NotificationsTestSupport.initialiserRuntime(environnement);
  const snapshot = await runtime.runtimeMonitoringNotifications.observer();

  assert.ok(snapshot.signauxRecents.some((signal) => signal.nom === 'notifications.test.signal'));
  assert.equal(snapshot.files.totalDispatch, 1);
  assert.equal(snapshot.providers.totalProviders >= 2, true);
});
