import assert from 'node:assert/strict';
import test from 'node:test';

import { ConfigurationRuntimeSynchronisationService } from '../services/ConfigurationRuntimeSynchronisationService';
import {
  type CreateConfigurationCommand,
  CreateConfigurationUseCase,
  RepositoryConfigurationMemoire,
} from '../../shared/configuration';
import {
  AuditConfigurationTestDouble,
  MonitoringConfigurationTestDouble,
} from '../../shared/configuration/tests/support/ConfigurationTestSupport';
import type { NotificationConfigurationChange } from '../../shared/notifications/integration/configuration';

async function creerConfiguration(
  repository: RepositoryConfigurationMemoire,
  params: {
    configurationId: string;
    key: string;
    value: unknown;
    scope?: {
      niveau: 'SYSTEM' | 'ORGANIZATION' | 'SCHOOL' | 'USER';
      organisationId?: string;
      ecoleId?: string;
      utilisateurId?: string;
    };
  },
): Promise<void> {
  const useCase = new CreateConfigurationUseCase(
    repository,
    new AuditConfigurationTestDouble(),
    new MonitoringConfigurationTestDouble(),
  );

  await useCase.executer({
    configurationId: params.configurationId,
    key: params.key,
    value: params.value as CreateConfigurationCommand['value'],
    scope: params.scope ?? { niveau: 'SYSTEM' },
    actorId: 'system-sync',
  });
}

test('ConfigurationRuntimeSynchronisationService hydrate le runtime et les notifications au demarrage', async () => {
  const repository = new RepositoryConfigurationMemoire();
  const changementsNotifications: NotificationConfigurationChange[] = [];

  await creerConfiguration(repository, {
    configurationId: 'cfg-runtime-cache',
    key: 'runtime.cache.ttlSeconds',
    value: 300,
  });
  await creerConfiguration(repository, {
    configurationId: 'cfg-provider-email',
    key: 'notifications.providers.email.enabled',
    value: false,
  });
  await creerConfiguration(repository, {
    configurationId: 'cfg-runtime-retry',
    key: 'notifications.retry.maxAttempts',
    value: 7,
  });
  await creerConfiguration(repository, {
    configurationId: 'cfg-user-pref',
    key: 'notifications.preferences.muted',
    value: true,
    scope: {
      niveau: 'USER',
      organisationId: 'org-1',
      ecoleId: 'school-1',
      utilisateurId: 'user-1',
    },
  });

  const service = new ConfigurationRuntimeSynchronisationService(
    async () => repository.stockageMemoire().lister().map((entry) => entry.configuration),
    async (changement) => {
      changementsNotifications.push(changement);
    },
  );

  await service.synchroniserAuDemarrage();

  const runtime = service.obtenirRuntimeCourant().valeur();

  assert.equal(runtime.cache.ttlSecondes, 300);
  assert.equal(changementsNotifications.length, 2);
  assert.deepEqual(
    changementsNotifications.map((changement) => changement.source).sort(),
    ['PROVIDER', 'RUNTIME'],
  );
  assert.equal(
    changementsNotifications.find((changement) => changement.source === 'PROVIDER')?.valeurs.actif,
    false,
  );
  assert.equal(
    changementsNotifications.find((changement) => changement.source === 'RUNTIME')?.valeurs['notifications.retry.maxAttempts'],
    7,
  );
});

test('ConfigurationRuntimeSynchronisationService recharge seulement la configuration notification ciblee', async () => {
  const repository = new RepositoryConfigurationMemoire();
  const changementsNotifications: NotificationConfigurationChange[] = [];

  await creerConfiguration(repository, {
    configurationId: 'cfg-runtime-replay',
    key: 'runtime.replay.enabled',
    value: false,
  });
  await creerConfiguration(repository, {
    configurationId: 'cfg-provider-sms',
    key: 'notifications.providers.sms.enabled',
    value: true,
  });

  const service = new ConfigurationRuntimeSynchronisationService(
    async () => repository.stockageMemoire().lister().map((entry) => entry.configuration),
    async (changement) => {
      changementsNotifications.push(changement);
    },
  );

  await service.rechargerConfiguration('cfg-provider-sms', true);

  const runtime = service.obtenirRuntimeCourant().valeur();

  assert.equal(runtime.replay.actif, false);
  assert.equal(changementsNotifications.length, 1);
  assert.equal(changementsNotifications[0]?.source, 'PROVIDER');
  assert.equal(changementsNotifications[0]?.valeurs.canal, 'SMS');
  assert.equal(changementsNotifications[0]?.valeurs.actif, true);
});
