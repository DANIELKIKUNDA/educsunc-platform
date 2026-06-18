import assert from 'node:assert/strict';
import test from 'node:test';
import { CONTEXT_ROLE_PAR_DEFAUT, RequestContextFactory } from 'shared/context';
import { AffectationTitulariat, ScopeAcces, TypeScope } from 'shared/security/domain';

test('RequestContextFactory cree un contexte initial propre avec requestId', () => {
  const contexte = RequestContextFactory.creerContexteInitial({
    requestId: 'req-1',
    adresseIp: '127.0.0.1',
    userAgent: 'tests',
  });

  assert.equal(contexte.requestId, 'req-1');
  assert.equal(contexte.adresseIp, '127.0.0.1');
  assert.equal(contexte.userAgent, 'tests');
  assert.deepEqual(contexte.permissions, []);
  assert.deepEqual(contexte.restrictions, []);
  assert.deepEqual(contexte.scopes, []);
  assert.deepEqual(contexte.titulariats, []);
  assert.equal(contexte.modeOffline, false);
});

test('RequestContextFactory enrichit progressivement AUTH puis SECURITY', () => {
  const contexteInitial = RequestContextFactory.creerContexteInitial({
    requestId: 'req-2',
  });
  const scope = ScopeAcces.creer(new TypeScope('ECOLE'), 'ecole-1');
  const titulariat = AffectationTitulariat.attribuer({
    idUtilisateur: 'u-1',
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idClasse: 'classe-1',
    idAnneeScolaire: 'annee-1',
  });

  const contexteAuth = RequestContextFactory.enrichirAuth(contexteInitial, {
    utilisateurId: 'u-1',
    sessionId: 'session-1',
    organisationActiveId: 'org-1',
    ecoleActiveId: 'ecole-1',
    modeOffline: true,
  });
  const contexteFinal = RequestContextFactory.enrichirSecurity(contexteAuth, {
    roleActif: 'ENSEIGNANT',
    permissions: ['bulletins.read', 'bulletins.read'],
    restrictions: ['INTERDICTION_CAISSE'],
    scopes: [scope],
    titulariats: [titulariat],
  });

  assert.equal(contexteAuth.roleActif, CONTEXT_ROLE_PAR_DEFAUT);
  assert.equal(contexteFinal.utilisateurId, 'u-1');
  assert.equal(contexteFinal.sessionId, 'session-1');
  assert.equal(contexteFinal.roleActif, 'ENSEIGNANT');
  assert.deepEqual(contexteFinal.permissions, ['bulletins.read']);
  assert.deepEqual(contexteFinal.restrictions, ['INTERDICTION_CAISSE']);
  assert.equal(contexteFinal.scopes[0]?.obtenirValeurScope(), 'ecole-1');
  assert.equal(contexteFinal.titulariats[0]?.obtenirIdUtilisateur(), 'u-1');
  assert.equal(contexteFinal.modeOffline, true);
});
