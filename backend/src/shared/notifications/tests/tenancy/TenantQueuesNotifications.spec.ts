import assert from 'node:assert/strict';
import test from 'node:test';
import { NotificationsTestSupport } from '../support/NotificationsTestSupport';

test('les jobs de file preservent leur contexte tenant dans les metadata techniques', async () => {
  const environnement = NotificationsTestSupport.creerEnvironnement();

  await environnement.fileNotifications.ajouter('notification-1', {
    organisationId: 'org-1',
    ecoleId: 'ecole-1',
  });

  const job = environnement.registreFilesNotifications.obtenirFile('DISPATCH')[0];
  assert.equal(job?.metadata.organisationId, 'org-1');
  assert.equal(job?.metadata.ecoleId, 'ecole-1');
});
