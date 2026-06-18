import assert from 'node:assert/strict';
import test from 'node:test';
import { StockageChronologieNotification } from 'shared/notifications';
import { RuntimeNotificationFactory } from '../factories/RuntimeNotificationFactory';
import { NotificationsTestSupport } from '../support/NotificationsTestSupport';

test('la chronology Notifications reste append-only et preserve l ordre des projections', async () => {
  const environnement = NotificationsTestSupport.creerEnvironnement();
  const stockage = new StockageChronologieNotification(environnement.registreNotificationsMemoire);
  const identifiantNotification = 'notification-chronology';

  await stockage.ajouterEntree(
    identifiantNotification,
    RuntimeNotificationFactory.creerEntreeChronologie('entree-1', 'CREATED', undefined, 'QUEUED'),
  );
  await stockage.ajouterEntree(
    identifiantNotification,
    RuntimeNotificationFactory.creerEntreeChronologie('entree-2', 'PROCESSING', 'QUEUED', 'PROCESSING'),
  );

  const projection = await stockage.lireProjection(identifiantNotification);
  assert.equal(projection.length, 2);
  assert.equal(projection[0]?.appendOnly, true);
  assert.equal(projection[0]?.typeEvenement, 'CREATED');
  assert.equal(projection[1]?.typeEvenement, 'PROCESSING');
});
