import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ChronologieNotification,
  ReconstruteurChronologieNotification,
  RegistreNotificationsMemoire,
  StockageChronologieNotification,
} from 'shared/notifications';
import { RuntimeNotificationFactory } from '../factories/RuntimeNotificationFactory';

test('la reconstruction de chronology reordonne la projection technique', async () => {
  const registre = new RegistreNotificationsMemoire();
  const stockage = new StockageChronologieNotification(registre);
  const reconstruteur = new ReconstruteurChronologieNotification(stockage);
  const entree1 = RuntimeNotificationFactory.creerEntreeChronologie('notification-1', 'event-b', 'QUEUED', 'PROCESSING');
  const entree2 = RuntimeNotificationFactory.creerEntreeChronologie('notification-1', 'event-a', 'CREATED', 'QUEUED');

  const resultat = await reconstruteur.reconstruire(
    'notification-1',
    new ChronologieNotification('DETAILED', 'corr-1', 'req-1'),
    [entree1, entree2],
  );

  assert.equal(resultat.totalEntrees, 2);
  assert.equal(resultat.granularite, 'DETAILED');
});
