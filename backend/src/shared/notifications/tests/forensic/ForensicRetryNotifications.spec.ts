import assert from 'node:assert/strict';
import test from 'node:test';
import { StockageForensicNotifications } from 'shared/notifications';
import { RuntimeNotificationFactory } from '../factories/RuntimeNotificationFactory';

test('la vue forensic consolide aussi le compteur de retries techniques', () => {
  const stockage = new StockageForensicNotifications();
  const vue = stockage.enregistrer(
    RuntimeNotificationFactory.creerEnregistrement({
      identifiant: 'notification-1',
      compteurRetry: 2,
    }),
    4,
    [],
  );

  assert.equal(vue.totalRetries, 2);
  assert.equal(vue.chronologyCount, 4);
});
