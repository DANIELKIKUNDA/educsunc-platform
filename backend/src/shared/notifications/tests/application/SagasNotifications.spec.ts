import assert from 'node:assert/strict';
import test from 'node:test';
import {
  SagaDiffusionMultiCanale,
  SagaEscaladeNotification,
  SagaExpirationNotification,
  SagaFallbackNotification,
  SagaReplayNotification,
  SagaRetryNotification,
} from 'shared/notifications/application';

test('les sagas applicatives deleguent bien a leurs orchestrateurs respectifs', async () => {
  const appels: string[] = [];
  const orchestrateur = {
    executer: async () => {
      appels.push('executer');
    },
  };

  await new SagaReplayNotification(orchestrateur as never).executer({
    identifiantNotification: 'notification-1',
    raison: 'replay',
  });
  await new SagaRetryNotification(orchestrateur as never).executer({
    identifiantNotification: 'notification-1',
    raison: 'retry',
    action: 'PLANIFIER',
  });
  await new SagaEscaladeNotification(orchestrateur as never).executer({
    identifiantNotification: 'notification-1',
    raison: 'escalade',
  });
  await new SagaExpirationNotification(orchestrateur as never).executer({
    identifiantNotification: 'notification-1',
    raison: 'expiration',
  } as never);
  await new SagaDiffusionMultiCanale(orchestrateur as never).executer({
    identifiantNotification: 'notification-1',
  } as never);
  await new SagaFallbackNotification(orchestrateur as never).executer(
    'notification-1',
    'fallback',
  );

  assert.equal(appels.length, 6);
});
