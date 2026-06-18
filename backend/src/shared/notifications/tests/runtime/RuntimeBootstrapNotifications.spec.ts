import assert from 'node:assert/strict';
import test from 'node:test';
import { NotificationsAssertions } from '../support/NotificationsAssertions';
import { NotificationsTestSupport } from '../support/NotificationsTestSupport';

test('le bootstrap runtime initialise et active le runtime Notifications', () => {
  const environnement = NotificationsTestSupport.creerEnvironnement();
  const runtime = NotificationsTestSupport.initialiserRuntime(environnement);
  const snapshot = runtime.registreRuntimeNotifications.observer();

  NotificationsAssertions.verifierComposantRuntime(snapshot, 'runtime');
  assert.equal(snapshot.composants.find((composant) => composant.nom === 'runtime')?.statut, 'ACTIF');
});
