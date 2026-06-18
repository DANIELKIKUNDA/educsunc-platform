import assert from 'node:assert/strict';
import test from 'node:test';
import { RegistreNotificationsMemoire, StockageChronologieNotification } from 'shared/notifications';
import { RuntimeNotificationFactory } from '../factories/RuntimeNotificationFactory';

test('le stockage chronology preserve correlationId et requestId sur la projection technique', async () => {
  const registre = new RegistreNotificationsMemoire();
  const stockage = new StockageChronologieNotification(registre);

  await stockage.ajouterEntree(
    'notification-1',
    RuntimeNotificationFactory.creerEntreeChronologie('notification-1'),
  );

  const projection = await stockage.lireProjection('notification-1');
  assert.equal(projection[0]?.correlationId, 'corr-notifications-test');
  assert.equal(projection[0]?.requestId, 'req-notifications-test');
});
