import assert from 'node:assert/strict';
import test from 'node:test';
import { NotificationsTestSupport } from '../support/NotificationsTestSupport';

test('la sante runtime remonte un etat sain apres initialisation propre', async () => {
  const environnement = NotificationsTestSupport.creerEnvironnement();
  const runtime = NotificationsTestSupport.initialiserRuntime(environnement);

  const sante = await runtime.santeRuntimeNotifications.observer();

  assert.equal(sante.sain, true);
  assert.equal(sante.providersIndisponibles, 0);
  assert.equal(sante.totalComposants >= 1, true);
});
