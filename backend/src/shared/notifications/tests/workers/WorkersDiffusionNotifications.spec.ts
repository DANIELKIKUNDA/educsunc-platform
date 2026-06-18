import assert from 'node:assert/strict';
import test from 'node:test';
import { WorkerDiffusionNotifications } from 'shared/notifications';
import { RuntimeNotificationFactory } from '../factories/RuntimeNotificationFactory';
import { NotificationsAssertions } from '../support/NotificationsAssertions';
import { NotificationsTestSupport } from '../support/NotificationsTestSupport';

test('le worker racine de diffusion consomme la file de dispatch et livre sans dead-letter', async () => {
  const environnement = NotificationsTestSupport.creerEnvironnement();
  const enregistrement = RuntimeNotificationFactory.creerEnregistrement({
    identifiant: 'notification-dispatch',
    canaux: ['IN_APP'],
  });
  environnement.registreNotificationsMemoire.enregistrements.set(enregistrement.identifiant, enregistrement);
  await environnement.fileNotifications.ajouter(enregistrement.identifiant, {
    destinataire: 'destinataire-worker',
    organisationId: enregistrement.organisationId,
    ecoleId: enregistrement.ecoleId,
    correlationId: enregistrement.correlationId,
    requestId: enregistrement.requestId,
  });

  const worker = new WorkerDiffusionNotifications(environnement.workerDiffusionNotification);
  const resultat = await worker.executerCycle();

  NotificationsAssertions.verifierWorkerReussi(resultat);
  assert.equal(environnement.fileDeadLetterNotifications.lireToutes().length, 0);
});
