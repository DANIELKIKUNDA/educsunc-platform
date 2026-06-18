import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ListerNotifications,
  ObtenirChronologieNotification,
  ObtenirMonitoringNotifications,
  OrchestrateurMonitoringNotification,
} from 'shared/notifications/application';
import { DepotLectureNotificationsMemoire, DepotNotificationsMemoire, RegistreNotificationsMemoire } from 'shared/notifications';
import { NotificationFactory } from '../factories/NotificationFactory';

test('les cas d usage de lecture servent des projections coherentes', async () => {
  const registre = new RegistreNotificationsMemoire();
  const depot = new DepotNotificationsMemoire(registre);
  const lecture = new DepotLectureNotificationsMemoire(registre);
  const monitoringSignals: string[] = [];
  const notification = NotificationFactory.creer();
  notification.valider();
  notification.mettreEnFile();
  await depot.sauvegarder(notification);

  const liste = await new ListerNotifications(lecture).executer({
    organisationId: 'org-notifications-test',
    page: 1,
    taillePage: 10,
  });
  const chronologie = await new ObtenirChronologieNotification(lecture).executer({
    identifiantNotification: notification.obtenirIdentifiant().obtenirValeur(),
  });
  const monitoring = await new ObtenirMonitoringNotifications(
    new OrchestrateurMonitoringNotification(lecture, {
      enregistrerSignal: async (nom) => {
        monitoringSignals.push(nom);
      },
    }),
  ).executer({
    organisationId: 'org-notifications-test',
  });

  assert.equal(liste.total, 1);
  assert.ok(chronologie.elements.length >= 2);
  assert.equal(monitoring.totalNotifications, 1);
  assert.deepEqual(monitoringSignals, ['notifications.monitoring.read']);
});
