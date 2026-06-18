import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DepotLectureNotificationsMemoire,
  DepotNotificationsMemoire,
  InformationsReplay,
  RegistreNotificationsMemoire,
} from 'shared/notifications';
import { NotificationFactory } from '../factories/NotificationFactory';

test('le diagnostic de replay reflète les tentatives deja ouvertes sur une notification', async () => {
  const registre = new RegistreNotificationsMemoire();
  const depot = new DepotNotificationsMemoire(registre);
  const lecture = new DepotLectureNotificationsMemoire(registre);
  const notification = NotificationFactory.creer({
    informationsReplay: new InformationsReplay(1, 'rejeu de test', 'acteur-1'),
  });

  await depot.sauvegarder(notification);

  const diagnostic = await lecture.obtenirDiagnosticReplay({
    identifiantNotification: notification.obtenirIdentifiant().obtenirValeur(),
  });

  assert.equal(diagnostic.totalReplays, 1);
  assert.equal(diagnostic.rebatirChronologie, true);
});
