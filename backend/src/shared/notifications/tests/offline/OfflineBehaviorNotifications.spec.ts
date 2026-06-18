import assert from 'node:assert/strict';
import test from 'node:test';
import { PolitiqueOfflineNotification } from 'shared/notifications/domain';
import { NotificationFactory } from '../factories/NotificationFactory';

test('la notification conserve explicitement son comportement offline-first dans l agregat', () => {
  const notification = NotificationFactory.creer({
    comportementOffline: 'MUST_SYNC',
    politiqueOffline: new PolitiqueOfflineNotification('MUST_SYNC'),
  });

  assert.equal(notification.comportementOffline, 'MUST_SYNC');
  assert.equal(notification.politiqueOffline.comportement, 'MUST_SYNC');
});
