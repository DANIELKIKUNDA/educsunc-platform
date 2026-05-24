import assert from 'node:assert/strict';
import test from 'node:test';
import { obtenirSharedEventBus } from 'shared/infrastructure/bus';
import { creerAuditRuntime } from '../../../../app/plugins/audit-runtime';
import { reinitialiserEtatAuditTests } from '../support/AuditTestSupport';
import { assertContainsEventNames } from '../helpers/AuditAssertions';

test('le runtime Audit observe AUTH SECURITY NOTIFICATIONS et CONFIGURATION via le bus partage', async () => {
  reinitialiserEtatAuditTests();
  creerAuditRuntime();
  const bus = obtenirSharedEventBus();

  await bus.publier('UserLoggedIn', {}, { correlationId: 'corr-auth', requestId: 'req-auth' });
  await bus.publier('PermissionDenied', {}, { correlationId: 'corr-sec', requestId: 'req-sec' });
  await bus.publier('NotificationQueued', {}, { correlationId: 'corr-notif', requestId: 'req-notif' });
  await bus.publier('ConfigurationVersionChanged', {}, { correlationId: 'corr-conf', requestId: 'req-conf' });

  const names = bus.lister().map((event) => event.name);
  assertContainsEventNames(names, [
    'UserLoggedIn',
    'PermissionDenied',
    'NotificationQueued',
    'ConfigurationVersionChanged',
  ]);
  assert.equal(bus.lister().length, 4);
});
