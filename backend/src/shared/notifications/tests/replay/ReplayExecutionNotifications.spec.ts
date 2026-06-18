import assert from 'node:assert/strict';
import test from 'node:test';
import { ExecutantReplayNotification, RegulateurReplayNotification } from 'shared/notifications';
import { RuntimeNotificationFactory } from '../factories/RuntimeNotificationFactory';
import { NotificationsTestSupport } from '../support/NotificationsTestSupport';

test('le moteur de replay execute un rejeu non destructif et historise l operation', async () => {
  const environnement = NotificationsTestSupport.creerEnvironnement();
  await environnement.stockageChronologieNotification.ajouterEntree(
    'notification-replay',
    RuntimeNotificationFactory.creerEntreeChronologie('replay-1'),
  );

  const executant = new ExecutantReplayNotification(
    environnement.fileReplayNotifications,
    new RegulateurReplayNotification(environnement.fileReplayNotifications),
    environnement.stockageReplayNotification,
    environnement.stockageChronologieNotification,
    environnement.adaptateurMonitoringNotification,
  );

  await environnement.fileReplayNotifications.ajouter('notification-replay', {
    correlationId: 'corr-replay',
    requestId: 'req-replay',
    rebatirChronologie: true,
  });

  const resultats = await executant.executerCycle();
  const historique = environnement.stockageReplayNotification.lireHistorique('notification-replay');

  assert.equal(resultats.length, 1);
  assert.equal(resultats[0]?.succes, true);
  assert.equal(historique.length, 1);
  assert.equal(historique[0]?.rebatirChronologie, true);
});
