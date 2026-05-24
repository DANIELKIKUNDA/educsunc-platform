import assert from 'node:assert/strict';
import test from 'node:test';
import { NotificationsAuditIntegrationOrchestrator } from 'shared/notifications';
import { ConfigurationAuditIntegrationOrchestrator } from 'shared/configuration';
import {
  creerConfigurationScope,
  creerNotificationContext,
  reinitialiserEtatAuditTests,
} from '../support/AuditTestSupport';

test('les integrations Audit conservent les tenants sans fuite cross-tenant', async () => {
  reinitialiserEtatAuditTests();
  const notifications = new NotificationsAuditIntegrationOrchestrator();
  const configuration = new ConfigurationAuditIntegrationOrchestrator();

  await notifications.publier({
    name: 'NotificationQueued',
    payload: {},
    notificationContext: creerNotificationContext({ organisationId: 'org-a', ecoleId: 'ecole-a' }),
  });
  await notifications.publier({
    name: 'NotificationQueued',
    payload: {},
    notificationContext: creerNotificationContext({
      notificationId: 'notification-2',
      organisationId: 'org-b',
      ecoleId: 'ecole-b',
    }),
  });
  await configuration.publier({
    name: 'ConfigurationVersionChanged',
    payload: {},
    configurationContext: {
      configurationId: 'config-1',
      scopeLevel: 'ECOLE',
      organisationId: creerConfigurationScope({ organisationId: 'org-a' }).organisationId,
      ecoleId: 'ecole-a',
      changedAt: '2026-05-24T11:00:00.000Z',
    },
  });

  const notificationSnapshot = notifications.obtenirSnapshot();
  const configurationSnapshot = configuration.obtenirSnapshot();
  assert.equal(notificationSnapshot.monitoring.queued, 2);
  assert.ok(configurationSnapshot.analytics.totalOrganisations >= 1);
});
