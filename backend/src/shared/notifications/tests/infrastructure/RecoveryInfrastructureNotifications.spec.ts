import assert from 'node:assert/strict';
import test from 'node:test';
import { RuntimeNotificationFactory } from '../factories/RuntimeNotificationFactory';
import { NotificationsTestSupport } from '../support/NotificationsTestSupport';

test('la recovery de stockage expose une coherence positive sur les snapshots connus', () => {
  const environnement = NotificationsTestSupport.creerEnvironnement();
  const enregistrement = RuntimeNotificationFactory.creerEnregistrement({
    identifiant: 'notification-stockage',
  });

  environnement.gestionCycleVieStockageNotifications.enregistrerActif(enregistrement);
  const resultat = environnement.recuperationStockageNotifications.verifierCoherence();

  assert.equal(resultat.cible, 'STORAGE');
  assert.equal(resultat.succes, true);
  assert.equal(resultat.elementsTraites >= 1, true);
});
