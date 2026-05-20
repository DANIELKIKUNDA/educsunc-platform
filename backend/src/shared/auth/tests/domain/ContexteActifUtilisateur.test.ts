import test from 'node:test';
import assert from 'node:assert/strict';
import { ErreurContexteTenantIncoherent } from 'shared/auth/domain';
import { creerContexteActifAuth } from '../support/AuthTestSupport';

test('doit changer organisation active et ecole active', () => {
  const contexte = creerContexteActifAuth('utilisateur-1');
  contexte.changerOrganisationActive('org-1');
  contexte.changerEcoleActive('ecole-1', true);

  assert.equal(contexte.obtenirOrganisationActiveId(), 'org-1');
  assert.equal(contexte.obtenirEcoleActiveId(), 'ecole-1');
});

test('doit refuser une ecole sans organisation active', () => {
  const contexte = creerContexteActifAuth('utilisateur-1');
  assert.throws(() => contexte.changerEcoleActive('ecole-1', true), ErreurContexteTenantIncoherent);
});

test('doit empecher une ecole hors organisation active', () => {
  const contexte = creerContexteActifAuth('utilisateur-1', 'org-1');
  assert.throws(() => contexte.changerEcoleActive('ecole-2', false), ErreurContexteTenantIncoherent);
});
