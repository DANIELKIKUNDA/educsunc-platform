import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DepotLectureNotificationsMemoire,
  DepotNotificationsMemoire,
  RegistreNotificationsMemoire,
} from 'shared/notifications';
import { NotificationFactory } from '../factories/NotificationFactory';

test('la persistence memoire restitue les notifications et leurs projections de lecture', async () => {
  const registre = new RegistreNotificationsMemoire();
  const depot = new DepotNotificationsMemoire(registre);
  const lecture = new DepotLectureNotificationsMemoire(registre);
  const notification = NotificationFactory.creer();
  notification.valider();
  notification.mettreEnFile();

  await depot.sauvegarder(notification);

  const relue = await depot.rechercherParId(notification.obtenirIdentifiant().obtenirValeur());
  const liste = await lecture.lister({
    organisationId: 'org-notifications-test',
    page: 1,
    taillePage: 10,
  });

  assert.equal(relue?.obtenirIdentifiant().obtenirValeur(), notification.obtenirIdentifiant().obtenirValeur());
  assert.equal(liste.total, 1);
});
