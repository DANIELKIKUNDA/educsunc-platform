import assert from 'node:assert/strict';
import test from 'node:test';
import { NotificationsTestSupport } from '../support/NotificationsTestSupport';

test('la recovery des files purge les jobs invalides et laisse les jobs sains disponibles', () => {
  const environnement = NotificationsTestSupport.creerEnvironnement();

  environnement.registreFilesNotifications.obtenirFile('DISPATCH').push({
    identifiantJob: '',
    identifiantNotification: '',
    typeFile: 'DISPATCH',
    metadata: {},
    tentative: 0,
    creeLe: new Date(),
    disponibleLe: new Date(),
  });
  environnement.registreFilesNotifications.obtenirFile('DISPATCH').push({
    identifiantJob: 'job-valide',
    identifiantNotification: 'notification-valide',
    typeFile: 'DISPATCH',
    metadata: {},
    tentative: 0,
    creeLe: new Date(),
    disponibleLe: new Date(),
  });

  const resultat = environnement.recuperationQueuesNotifications.nettoyerJobsInvalides();
  const volumes = environnement.recuperationQueuesNotifications.observerVolumes();

  assert.equal(resultat.elementsTraites, 1);
  assert.equal(volumes.metadata.DISPATCH, 1);
});
