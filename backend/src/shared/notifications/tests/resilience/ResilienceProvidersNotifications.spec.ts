import assert from 'node:assert/strict';
import test from 'node:test';
import {
  AdaptateurPanneProviderNotification,
  ProviderNotificationEmail,
} from 'shared/notifications';

test('l adaptateur de panne degrade proprement un provider sans lever d exception', async () => {
  const provider = new AdaptateurPanneProviderNotification(new ProviderNotificationEmail());
  provider.forcerEtat('INDISPONIBLE');

  const resultat = await provider.envoyer({
    identifiantNotification: 'notification-1',
    canal: 'EMAIL',
    destinataires: ['dest@test.local'],
    sujet: 'Sujet',
    contenu: 'Contenu',
    metadata: {},
  } as never);
  const sante = await provider.verifierSante();

  assert.equal(resultat.succes, false);
  assert.equal(sante.etat, 'INDISPONIBLE');
});
