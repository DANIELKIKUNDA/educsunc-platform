import test from 'node:test';
import assert from 'node:assert/strict';
import { ErreurContexteTenantIncoherent, MoteurContexteActif } from 'shared/auth/domain';
import { creerContexteActifAuth } from '../support/AuthTestSupport';

test('changement ecole active et organisation active', () => {
  const moteur = new MoteurContexteActif();
  const contexte = creerContexteActifAuth('utilisateur-1');

  moteur.changerOrganisationActive(contexte, 'org-1', ['org-1']);
  moteur.changerEcoleActive(contexte, 'ecole-1', ['ecole-1'], true);

  assert.equal(contexte.obtenirOrganisationActiveId(), 'org-1');
  assert.equal(contexte.obtenirEcoleActiveId(), 'ecole-1');
});

test('verification tenant refuse une ecole incoherente', () => {
  const moteur = new MoteurContexteActif();
  const contexte = creerContexteActifAuth('utilisateur-1', 'org-1');
  assert.throws(() => moteur.changerEcoleActive(contexte, 'ecole-2', ['ecole-2'], false), ErreurContexteTenantIncoherent);
});
