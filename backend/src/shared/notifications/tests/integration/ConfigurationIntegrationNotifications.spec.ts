import assert from 'node:assert/strict';
import test from 'node:test';
import { NotificationsConfigurationIntegrationOrchestrator } from 'shared/notifications';

test('le pont configuration applique runtime, provider et quota dans le meme snapshot', async () => {
  const orchestrateur = new NotificationsConfigurationIntegrationOrchestrator();

  await orchestrateur.appliquerChangement({
    source: 'RUNTIME',
    contexteConfiguration: {
      organisationId: 'org-1',
      ecoleId: 'ecole-1',
    } as never,
    valeurs: {
      'notifications.dispatch.autoQueue': false,
    },
  });
  await orchestrateur.appliquerChangement({
    source: 'PROVIDER',
    contexteConfiguration: {} as never,
    valeurs: {
      canal: 'EMAIL',
      actif: true,
      timeoutMs: 20_000,
    },
  });
  await orchestrateur.appliquerChangement({
    source: 'QUOTA',
    contexteConfiguration: {} as never,
    valeurs: {
      canal: 'EMAIL',
      limiteParHeure: 200,
      limiteParJour: 500,
    },
  });

  const autoQueue = await orchestrateur.lire('notifications.dispatch.autoQueue', true);
  const snapshot = orchestrateur.obtenirSnapshot();

  assert.equal(autoQueue, false);
  assert.equal(snapshot.totalChangements, 3);
  assert.ok(snapshot.providers.some((provider) => provider.canal === 'EMAIL'));
  assert.ok(snapshot.quotas.some((quota) => quota.canal === 'EMAIL'));
});
