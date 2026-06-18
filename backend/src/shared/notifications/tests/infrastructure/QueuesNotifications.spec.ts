import assert from 'node:assert/strict';
import test from 'node:test';
import { NotificationsTestSupport } from '../support/NotificationsTestSupport';

test('les files techniques Notifications enfilent puis dead-letterisent un job sans le perdre', async () => {
  const environnement = NotificationsTestSupport.creerEnvironnement();

  await environnement.fileNotifications.ajouter('notification-queue', {
    correlationId: 'corr-queue',
    requestId: 'req-queue',
  });
  const job = environnement.fileNotifications.extraireProchainDisponible();

  assert.ok(job);
  await environnement.fileDeadLetterNotifications.placer(job, 'echec-technique');

  const deadLetters = environnement.fileDeadLetterNotifications.lireToutes();
  assert.equal(deadLetters.length, 1);
  assert.equal(deadLetters[0]?.identifiantNotification, 'notification-queue');
  assert.equal(deadLetters[0]?.raisonDeadLetter, 'echec-technique');
});
