import assert from 'node:assert/strict';
import test from 'node:test';
import { ExceptionRetryNotification } from 'shared/notifications/domain';
import { NotificationFactory } from '../factories/NotificationFactory';

test('l agregat Notification suit son cycle de vie principal et enrichit sa timeline', () => {
  const notification = NotificationFactory.creer();

  notification.valider();
  notification.mettreEnFile();
  notification.demarrerTraitement();
  const tentative = notification.demarrerTentativeLivraison('IN_APP', 'provider-notification-in-app');
  notification.marquerLivraisonReussie(tentative.obtenirId(), 'OK');

  assert.equal(notification.obtenirStatut(), 'SENT');
  assert.ok(notification.obtenirTimeline().length >= 5);
  assert.equal(notification.obtenirTentativesLivraison().length, 1);
});

test('une notification dont le retry est epuise ne peut plus etre replanifiee', () => {
  const notification = NotificationFactory.creer({
    informationsRetry: NotificationFactory.creer().obtenirInformationsRetry().incrementer('echec-1').incrementer('echec-2').incrementer('echec-3'),
  });

  assert.throws(() => notification.planifierRetry(), ExceptionRetryNotification);
});
