import assert from 'node:assert/strict';
import test from 'node:test';
import { RuntimeRecoveryNotifications } from 'shared/notifications';
import { NotificationsTestSupport } from '../support/NotificationsTestSupport';

test('le runtime de recovery retourne une passe globale stable meme a vide', async () => {
  const environnement = NotificationsTestSupport.creerEnvironnement();
  const runtimeRecovery = new RuntimeRecoveryNotifications(
    environnement.recuperationQueuesNotifications,
    environnement.recuperationStockageNotifications,
    environnement.recuperationProvidersNotifications,
    environnement.recuperationTenantNotifications,
    environnement.recuperationDeadLetterNotifications,
  );

  const operations = await runtimeRecovery.executerPasse();

  assert.equal(operations.length, 5);
  assert.ok(operations.every((operation) => operation.succes));
});
