import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ReconstruteurChronologieNotification,
  RegistreNotificationsMemoire,
  StockageChronologieNotification,
} from 'shared/notifications';
import { ChronologieNotification } from 'shared/notifications/domain';
import { RuntimeNotificationFactory } from '../factories/RuntimeNotificationFactory';

test('la couche chronology reconstruit une projection ordonnee et corrigee', async () => {
  const registre = new RegistreNotificationsMemoire();
  const stockage = new StockageChronologieNotification(registre);
  const reconstruteur = new ReconstruteurChronologieNotification(stockage);
  const entreeA = RuntimeNotificationFactory.creerEntreeChronologie('notification-1', 'A', 'CREATED', 'QUEUED');
  const entreeB = RuntimeNotificationFactory.creerEntreeChronologie('notification-1', 'B', 'QUEUED', 'PROCESSING');

  await stockage.ajouterEntree('notification-1', entreeB);
  await stockage.ajouterEntree('notification-1', entreeA);

  const resultat = await reconstruteur.reconstruire(
    'notification-1',
    new ChronologieNotification('FORENSIC', 'corr-1', 'req-1'),
    [entreeB, entreeA],
  );
  const projection = await stockage.lireProjection('notification-1');

  assert.equal(resultat.totalEntrees, 2);
  assert.equal(projection.length, 2);
  assert.equal(projection[0]?.correlationId, 'corr-notifications-test');
});
