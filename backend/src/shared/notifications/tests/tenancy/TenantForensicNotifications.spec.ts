import assert from 'node:assert/strict';
import test from 'node:test';
import { StockageForensicNotifications } from 'shared/notifications';
import { RuntimeNotificationFactory } from '../factories/RuntimeNotificationFactory';

test('la vue forensic reste rattachee au tenant d origine', () => {
  const stockage = new StockageForensicNotifications();
  const enregistrement = RuntimeNotificationFactory.creerEnregistrement({
    identifiant: 'notification-1',
    organisationId: 'org-tenant',
    ecoleId: 'ecole-tenant',
  });

  const vue = stockage.enregistrer(enregistrement, 3, []);

  assert.equal(vue.organisationId, 'org-tenant');
  assert.equal(vue.ecoleId, 'ecole-tenant');
});
