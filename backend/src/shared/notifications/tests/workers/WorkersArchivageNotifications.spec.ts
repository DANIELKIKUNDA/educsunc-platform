import assert from 'node:assert/strict';
import test from 'node:test';
import { WorkerArchivageNotifications } from 'shared/notifications';
import { RuntimeNotificationFactory } from '../factories/RuntimeNotificationFactory';
import { NotificationsTestSupport } from '../support/NotificationsTestSupport';

test('le worker racine d archivage consolide une notification deja terminale', async () => {
  const environnement = NotificationsTestSupport.creerEnvironnement();
  environnement.registreNotificationsMemoire.enregistrements.set(
    'notification-1',
    RuntimeNotificationFactory.creerEnregistrement({
      identifiant: 'notification-1',
      statut: 'ARCHIVED',
      dateArchivage: new Date(),
    }),
  );

  const resultat = await new WorkerArchivageNotifications(
    environnement.workerArchivageNotification,
  ).executerCycle();

  assert.equal(resultat.typeWorker, 'ARCHIVAGE');
  assert.equal(resultat.totalTraites, 1);
  assert.ok(environnement.stockageArchiveNotifications.lire('notification-1'));
});
