import assert from 'node:assert/strict';
import test from 'node:test';
import { RuntimeNotificationFactory } from '../factories/RuntimeNotificationFactory';
import { NotificationsTestSupport } from '../support/NotificationsTestSupport';

test('la coordination runtime execute les workers et consolide le registre', async () => {
  const environnement = NotificationsTestSupport.creerEnvironnement();
  const notificationDispatch = RuntimeNotificationFactory.creerEnregistrement({
    identifiant: 'notification-runtime-dispatch',
    canaux: ['IN_APP'],
  });
  const notificationArchive = RuntimeNotificationFactory.creerEnregistrement({
    identifiant: 'notification-runtime-archive',
    statut: 'ARCHIVED',
  });

  environnement.registreNotificationsMemoire.enregistrements.set(
    notificationDispatch.identifiant,
    notificationDispatch,
  );
  environnement.registreNotificationsMemoire.enregistrements.set(
    notificationArchive.identifiant,
    notificationArchive,
  );

  await environnement.fileNotifications.ajouter(notificationDispatch.identifiant, {
    destinataire: 'destinataire-runtime',
  });
  await environnement.fileRetryNotifications.ajouter('notification-runtime-retry');
  await environnement.fileReplayNotifications.ajouter('notification-runtime-replay');
  await environnement.fileEscaladeNotifications.ajouter('notification-runtime-escalade');

  const runtime = NotificationsTestSupport.initialiserRuntime(environnement);
  const resultat = await runtime.coordinateurRuntimeNotifications.executerCycleGlobal();
  const snapshot = runtime.registreRuntimeNotifications.observer();

  assert.equal(resultat.workers.length, 8);
  assert.ok(snapshot.derniersResultatsWorkers.length >= 8);
  assert.ok(snapshot.composants.some((composant) => composant.nom === 'worker:diffusion'));
});
