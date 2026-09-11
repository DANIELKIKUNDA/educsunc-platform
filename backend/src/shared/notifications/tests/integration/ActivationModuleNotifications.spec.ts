import assert from 'node:assert/strict';
import test from 'node:test';
import {
  obtenirNotificationsRuntime,
  reinitialiserNotificationsRuntime,
} from '../../../../app/plugins/notifications-runtime';
import { obtenirSharedEventBus } from '../../../infrastructure/bus';

test('une notification automatique d ecole est bloquee quand le module effectif est inactif', async () => {
  reinitialiserNotificationsRuntime();
  const contextesVerifies: Array<{ organisationId: string; ecoleId: string }> = [];
  obtenirNotificationsRuntime().configurerVerificationActivation(async (contexte) => {
    contextesVerifies.push(contexte);
    return false;
  });

  await obtenirSharedEventBus().publier(
    'PaiementValide',
    { idEcole: 'ecole-module-inactif', idOrganisation: 'organisation-module-inactif' },
    {
      organisationId: 'organisation-module-inactif',
      ecoleId: 'ecole-module-inactif',
    },
  );

  assert.deepEqual(contextesVerifies, [{
    organisationId: 'organisation-module-inactif',
    ecoleId: 'ecole-module-inactif',
  }]);
  reinitialiserNotificationsRuntime();
});
