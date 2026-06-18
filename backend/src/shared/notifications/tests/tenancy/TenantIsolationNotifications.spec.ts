import assert from 'node:assert/strict';
import test from 'node:test';
import { GardeIsolationTenantNotification } from 'shared/notifications';
import { RuntimeNotificationFactory } from '../factories/RuntimeNotificationFactory';
import { ORGANISATION_NOTIFICATION_TEST } from '../fixtures/NotificationsFixtures';

test('la garde tenant interdit une charge provider cross-tenant', () => {
  const garde = new GardeIsolationTenantNotification();
  const resultat = garde.verifierChargeProvider(
    {
      organisationId: ORGANISATION_NOTIFICATION_TEST,
      correlationId: 'corr',
      requestId: 'req',
      securityMetadata: {},
    },
    {
      identifiantNotification: 'notification-tenant',
      typeNotification: 'INFORMATION_GENERALE',
      canal: 'IN_APP',
      destinataire: 'user-1',
      message: 'message',
      metadata: {},
      organisationId: 'autre-organisation',
      criticite: 'IMPORTANT',
    },
  );

  assert.equal(resultat.autorise, false);
});

test('la garde tenant accepte une archive rattachee au tenant courant', () => {
  const garde = new GardeIsolationTenantNotification();
  const archive = {
    identifiantNotification: 'notification-archive',
    organisationId: ORGANISATION_NOTIFICATION_TEST,
    snapshot: RuntimeNotificationFactory.creerEnregistrement(),
    archiveLe: new Date(),
  };

  const resultat = garde.verifierArchive(
    {
      organisationId: ORGANISATION_NOTIFICATION_TEST,
      correlationId: 'corr',
      requestId: 'req',
      securityMetadata: {},
    },
    archive,
  );

  assert.equal(resultat.autorise, true);
});
