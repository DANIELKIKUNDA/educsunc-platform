import assert from 'node:assert/strict';
import test from 'node:test';
import { PlanificateurRetryNotification } from 'shared/notifications';
import { NotificationsTestSupport } from '../support/NotificationsTestSupport';

test('la planification retry applique un backoff croissant dans la file technique', async () => {
  const environnement = NotificationsTestSupport.creerEnvironnement();
  const planificateur = new PlanificateurRetryNotification(environnement.fileRetryNotifications);

  await planificateur.planifier('notification-1', 2, 5, {
    raison: 'smtp-down',
  });

  const job = environnement.registreFilesNotifications.obtenirFile('RETRY')[0];
  assert.equal(job?.metadata.raison, 'smtp-down');
  assert.equal(job?.metadata.delaiRetryMs, 90_000);
});
