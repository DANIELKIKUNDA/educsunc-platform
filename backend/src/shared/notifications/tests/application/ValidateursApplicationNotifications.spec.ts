import assert from 'node:assert/strict';
import test from 'node:test';
import { ValidateurCommandeCreationNotification } from 'shared/notifications/application';
import { CommandeNotificationFactory } from '../factories/CommandeNotificationFactory';

test('le validateur applicatif refuse une commande sans message utile', () => {
  const validateur = new ValidateurCommandeCreationNotification();
  const commande = CommandeNotificationFactory.creer({ message: '   ' });

  assert.throws(() => validateur.valider(commande));
});

test('le validateur applicatif accepte une commande complete', () => {
  const validateur = new ValidateurCommandeCreationNotification();
  const commande = CommandeNotificationFactory.creer();

  assert.doesNotThrow(() => validateur.valider(commande));
});
