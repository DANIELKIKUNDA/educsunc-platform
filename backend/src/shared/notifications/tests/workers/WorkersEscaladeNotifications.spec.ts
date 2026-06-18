import assert from 'node:assert/strict';
import test from 'node:test';
import { WorkerEscaladeNotifications } from 'shared/notifications';
import { NotificationsTestSupport } from '../support/NotificationsTestSupport';

test('le worker racine d escalade peut reprogrammer une rediffusion', async () => {
  const environnement = NotificationsTestSupport.creerEnvironnement();
  await environnement.fileEscaladeNotifications.ajouter('notification-1', {
    rediffuser: true,
    organisationId: 'org-1',
  });

  const resultat = await new WorkerEscaladeNotifications(
    environnement.workerEscaladeNotification,
  ).executerCycle();

  assert.equal(resultat.typeWorker, 'ESCALADE');
  assert.equal(resultat.totalTraites, 1);
  assert.equal(
    environnement.registreFilesNotifications.obtenirFile('DISPATCH').length,
    1,
  );
});
