import assert from 'node:assert/strict';
import test from 'node:test';
import { ConfigurationFactory } from '../factories/ConfigurationFactory';

test('le branding retourne les signataires actifs tries', () => {
  const branding = ConfigurationFactory.creerBranding();

  const signataires = branding.signatairesActifs();

  assert.equal(signataires[0]?.nom, 'Prefet');
  assert.equal(branding.logoPrincipalActif()?.url.includes('logo'), true);
});
