import assert from 'node:assert/strict';
import test from 'node:test';
import { ProviderNotificationEmail, ProviderNotificationSms, ProviderNotificationPush, ProviderNotificationInApp, type ChargeLivraisonNotification } from 'shared/notifications';
const charge: ChargeLivraisonNotification = { identifiantNotification:'notif-1', typeNotification:'INFORMATION_GENERALE', canal:'IN_APP', destinataire:'user-1', message:'Bonjour', metadata:{}, criticite:'BEST_EFFORT' };
test('les canaux externes non configures echouent fermes sans faux succes', async () => {
  assert.equal((await new ProviderNotificationEmail().envoyer({ ...charge, canal:'EMAIL' })).succes, false);
  assert.equal((await new ProviderNotificationSms().envoyer({ ...charge, canal:'SMS' })).succes, false);
  assert.equal((await new ProviderNotificationPush().envoyer({ ...charge, canal:'PUSH' })).succes, false);
});
test('in-app utilise l identifiant durable au lieu d inventer un identifiant fournisseur', async () => {
  const resultat = await new ProviderNotificationInApp().envoyer(charge);
  assert.equal(resultat.succes, true);
  assert.equal(resultat.identifiantLivraison, 'notif-1');
});
