import assert from 'node:assert/strict';
import test from 'node:test';
import { ProviderNotificationEmail, ProviderNotificationInApp, RegistreProvidersNotification } from 'shared/notifications';

test('le registre providers resout un provider principal par canal et publie un snapshot de sante', async () => {
  const registre = new RegistreProvidersNotification();
  registre.enregistrer(new ProviderNotificationInApp());
  registre.enregistrer(new ProviderNotificationEmail());

  const providerInApp = registre.resoudrePrincipal('IN_APP');
  const providerEmail = registre.resoudrePrincipal('EMAIL');
  const sante = await registre.verifierSanteGlobale();

  assert.equal(providerInApp?.obtenirNom(), 'provider-notification-in-app');
  assert.equal(providerEmail?.obtenirNom(), 'provider-notification-email');
  assert.equal(sante.length, 2);
  assert.equal(sante.every((rapport) => rapport.etat === 'SAIN'), true);
});
