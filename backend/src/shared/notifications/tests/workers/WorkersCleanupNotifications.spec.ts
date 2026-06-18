import assert from 'node:assert/strict';
import test from 'node:test';
import { WorkerCleanupNotifications } from 'shared/notifications';
import { NotificationsTestSupport } from '../support/NotificationsTestSupport';

test('le worker racine de cleanup purge les jobs invalides des files', async () => {
  const environnement = NotificationsTestSupport.creerEnvironnement();
  environnement.registreFilesNotifications.obtenirFile('DISPATCH').push({
    identifiantJob: '',
    identifiantNotification: '',
    typeFile: 'DISPATCH',
    disponibleLe: new Date(),
    creeLe: new Date(),
    tentative: 0,
    metadata: {},
  } as never);

  const resultat = await new WorkerCleanupNotifications(
    environnement.workerCleanupNotification,
  ).executerCycle();

  assert.equal(resultat.typeWorker, 'CLEANUP');
  assert.equal(environnement.registreFilesNotifications.obtenirFile('DISPATCH').length, 0);
});
