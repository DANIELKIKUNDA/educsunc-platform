import test from 'node:test';
import assert from 'node:assert/strict';
import { ContexteActifUtilisateur } from 'shared/security/domain';

test('contexte actif verifie coherence organisation et ecole actives', () => {
  const contexte = ContexteActifUtilisateur.creer('utilisateur-1');
  contexte.changerOrganisation('org-1');
  contexte.changerEcole('ecole-1', true);

  assert.equal(contexte.obtenirIdOrganisationActive(), 'org-1');
  assert.equal(contexte.obtenirIdEcoleActive(), 'ecole-1');
  contexte.verifierContexte();
});
