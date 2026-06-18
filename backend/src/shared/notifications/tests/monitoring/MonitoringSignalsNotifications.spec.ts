import assert from 'node:assert/strict';
import test from 'node:test';
import {
  AdaptateurMonitoringNotification,
  CollecteurMetriquesNotification,
  ProviderNotificationEmail,
  RegistreFilesNotifications,
  RegistreProvidersNotification,
  SurveillanceProvidersNotification,
  SurveillanceQueuesNotification,
} from 'shared/notifications';

test('les signaux de monitoring sont collectes et exposes dans le snapshot global', async () => {
  const registreFiles = new RegistreFilesNotifications();
  const registreProviders = new RegistreProvidersNotification();
  registreProviders.enregistrer(new ProviderNotificationEmail());
  const adaptateur = new AdaptateurMonitoringNotification(
    new CollecteurMetriquesNotification(),
    new SurveillanceQueuesNotification(registreFiles),
    new SurveillanceProvidersNotification(registreProviders),
  );

  await adaptateur.enregistrerSignal('notifications.created', {
    type: 'INFORMATION_GENERALE',
  });

  const snapshot = await adaptateur.observer();
  assert.equal(snapshot.signauxRecents.length, 1);
  assert.equal(snapshot.signauxRecents[0]?.nom, 'notifications.created');
});
