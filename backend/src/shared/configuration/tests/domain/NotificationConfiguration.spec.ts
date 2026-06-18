import assert from 'node:assert/strict';
import test from 'node:test';
import { ConfigurationFactory } from '../factories/ConfigurationFactory';

test('la configuration Notifications expose les canaux actifs', () => {
  const notifications = ConfigurationFactory.creerNotificationConfiguration();

  assert.equal(notifications.canalActif('EMAIL'), true);
  assert.equal(notifications.canalActif('SMS'), false);
});
