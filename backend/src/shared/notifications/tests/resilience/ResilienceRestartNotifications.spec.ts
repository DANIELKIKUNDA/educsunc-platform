import assert from 'node:assert/strict';
import test from 'node:test';
import { NotificationsTestSupport } from '../support/NotificationsTestSupport';

test('le runtime peut etre reinitialise proprement sans casser son diagnostic', async () => {
  const environnementA = NotificationsTestSupport.creerEnvironnement();
  const runtimeA = NotificationsTestSupport.initialiserRuntime(environnementA);
  const environnementB = NotificationsTestSupport.creerEnvironnement();
  const runtimeB = NotificationsTestSupport.initialiserRuntime(environnementB);

  const diagnosticA = await runtimeA.diagnosticRuntimeNotifications.diagnostiquer();
  const diagnosticB = await runtimeB.diagnosticRuntimeNotifications.diagnostiquer();

  assert.equal(diagnosticA.sante.sain, true);
  assert.equal(diagnosticB.sante.sain, true);
});
