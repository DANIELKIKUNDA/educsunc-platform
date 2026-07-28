import assert from 'node:assert/strict';
import test from 'node:test';
import Fastify from 'fastify';
import { requestContextPlugin } from '../../app/plugins/request-context.plugin';
import { creerAuthenticationPlugin } from '../../app/plugins/authentication.plugin';
import { creerSecurityPlugin } from '../../app/plugins/security.plugin';
import { tenancyPlugin } from '../../app/plugins/tenancy.plugin';
import { JwtTokenAdapter } from 'shared/auth/infrastructure';
import { SessionCacheService } from 'shared/auth/infrastructure';
import { SessionApplicationService } from 'shared/auth/application/services/SessionApplicationService';
import {
  creerContexteActifAuth,
  creerRefreshToken,
  creerRepositoriesMemoire as creerRepositoriesAuthMemoire,
  creerSessionUtilisateur,
  creerUtilisateurAuth,
} from 'shared/auth/tests/support/AuthTestSupport';
import {
  creerAffectationTitulariat,
  creerAffectationUtilisateur,
  creerRepositoriesMemoire as creerRepositoriesSecurityMemoire,
  creerRole,
} from 'shared/security/tests/support/SecurityTestSupport';

test('pipeline RequestContext -> AUTH -> SECURITY -> TENANCY enrichit la requete complete', async () => {
  const authRepositories = creerRepositoriesAuthMemoire();
  const securityRepositories = creerRepositoriesSecurityMemoire();

  const utilisateur = creerUtilisateurAuth({
    email: 'integration@test.cd',
  });
  const refreshToken = creerRefreshToken(utilisateur.obtenirId(), 'hash-refresh-1');
  const session = creerSessionUtilisateur({
    idUtilisateur: utilisateur.obtenirId(),
    refreshTokenId: refreshToken.obtenirId(),
    organisationActiveId: 'org-1',
    ecoleActiveId: 'ecole-1',
  });
  const contexteActif = creerContexteActifAuth(
    utilisateur.obtenirId(),
    'org-autre-session',
    'ecole-autre-session',
  );

  await authRepositories.depotUtilisateurAuth.sauvegarder(utilisateur);
  await authRepositories.depotRefreshToken.sauvegarder(refreshToken);
  await authRepositories.depotSessionUtilisateur.sauvegarder(session);
  await authRepositories.depotContexteActifAuth.sauvegarder(contexteActif);

  const role = creerRole({
    codeRole: 'ENSEIGNANT',
    permissions: ['bulletins.read', 'cotes.write'],
  });
  const affectation = creerAffectationUtilisateur({
    idUtilisateur: utilisateur.obtenirId(),
    idRole: role.obtenirId(),
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
  });
  affectation.ajouterScope('ECOLE', 'ecole-1');
  const titulariat = creerAffectationTitulariat({
    idUtilisateur: utilisateur.obtenirId(),
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
  });

  await securityRepositories.roleRepository.sauvegarder(role);
  await securityRepositories.affectationRepository.sauvegarder(affectation);
  await securityRepositories.titulariatRepository.sauvegarder(titulariat);

  const jwt = new JwtTokenAdapter();
  const accessToken = await jwt.genererJwt({
    sub: utilisateur.obtenirId(),
    sid: session.obtenirId(),
    email: utilisateur.obtenirEmail().obtenirValeur(),
    tokenVersion: utilisateur.obtenirTokenVersion().obtenirValeur(),
    organisationActiveId: 'org-1',
    ecoleActiveId: 'ecole-1',
  });

  const serveur = Fastify();
  await serveur.register(async (instance) => {
    await requestContextPlugin(instance, {});
    await creerAuthenticationPlugin({
      jwtTokenAdapter: jwt,
      utilisateurAuthRepository: authRepositories.depotUtilisateurAuth,
      contexteActifAuthRepository: authRepositories.depotContexteActifAuth,
      sessionApplicationService: new SessionApplicationService(
        authRepositories.depotSessionUtilisateur,
        authRepositories.depotRefreshToken,
        new SessionCacheService(),
      ),
    })(instance, {});
    await creerSecurityPlugin({
      roleRepository: securityRepositories.roleRepository,
      affectationUtilisateurRepository: securityRepositories.affectationRepository,
      affectationTitulariatRepository: securityRepositories.titulariatRepository,
      auditSecurityPort: null,
      ownershipParentPort: null,
      responsabiliteClassePedagogiquePort: {
        consulterActiveParClasseEtAnnee: async () => null,
        listerActivesParUtilisateur: async () => [{
          idOrganisation: 'org-1',
          idEcole: 'ecole-1',
          idClassePedagogique: 'classe-1',
          idClasseAcademique: 'classe-academique-1',
          idSectionScolaire: 'section-primaire',
          sectionCode: 'PRIMAIRE',
          sectionLibelle: 'Primaire',
          idAnneeScolaire: 'annee-1',
          idUtilisateurEnseignant: utilisateur.obtenirId(),
          active: true,
        }],
      },
    })(instance, {});
    await tenancyPlugin(instance, {});

    instance.get('/probe', async (requete) => ({
      requestId: requete.context.requestId,
      utilisateurId: requete.context.utilisateurId,
      sessionId: requete.context.sessionId,
      roleActif: requete.context.roleActif,
      organisationActiveId: requete.context.organisationActiveId,
      ecoleActiveId: requete.context.ecoleActiveId,
      permissions: requete.context.permissions,
      restrictions: requete.context.restrictions,
      scopes: requete.context.scopes.map((scope) => ({
        typeScope: scope.obtenirTypeScope().obtenirValeur(),
        valeurScope: scope.obtenirValeurScope(),
      })),
      titulariats: requete.context.titulariats.map((titulariat) => ({
        idUtilisateur: titulariat.obtenirIdUtilisateur(),
        idClasse: titulariat.obtenirIdClasse(),
      })),
      titulariatsEffectifs: requete.context.titulariatsEffectifs,
      estTitulaireEffectif: requete.context.estTitulaireEffectif,
      deviceId: requete.context.deviceId,
      tenantHeader: requete.headers['x-tenant-id'],
      organisationHeader: requete.headers['x-organisation-id'],
    }));
  });

  const reponse = await serveur.inject({
    method: 'GET',
    url: '/probe',
    headers: {
      authorization: `Bearer ${accessToken}`,
      'x-session-id': session.obtenirId(),
      'x-device-id': 'device-77',
    },
  });

  assert.equal(reponse.statusCode, 200, reponse.body);
  const corps = reponse.json() as {
    requestId: string;
    utilisateurId: string;
    sessionId: string;
    roleActif: string;
    organisationActiveId: string;
    ecoleActiveId: string;
    permissions: string[];
    restrictions: string[];
    scopes: Array<{ typeScope: string; valeurScope: string }>;
    titulariats: Array<{ idUtilisateur: string; idClasse: string }>;
    titulariatsEffectifs: Array<{ idClasse: string; idAnneeScolaire: string }>;
    estTitulaireEffectif: boolean;
    deviceId: string;
    tenantHeader: string;
    organisationHeader: string;
  };

  assert.equal(corps.utilisateurId, utilisateur.obtenirId());
  assert.equal(corps.sessionId, session.obtenirId());
  assert.equal(corps.roleActif, 'ENSEIGNANT');
  assert.equal(corps.organisationActiveId, 'org-1');
  assert.equal(corps.ecoleActiveId, 'ecole-1');
  assert.deepEqual(corps.permissions.sort(), ['bulletins.read', 'cotes.write']);
  assert.equal(corps.deviceId, 'device-77');
  assert.ok(corps.requestId);
  assert.deepEqual(corps.scopes, [
    { typeScope: 'ECOLE', valeurScope: 'ecole-1' },
    { typeScope: 'ORGANISATION', valeurScope: 'org-1' },
  ]);
  assert.equal(corps.titulariats[0]?.idUtilisateur, utilisateur.obtenirId());
  assert.equal(corps.estTitulaireEffectif, true);
  assert.deepEqual(corps.titulariatsEffectifs, [{
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idClasse: 'classe-1',
    idAnneeScolaire: 'annee-1',
    idSectionScolaire: 'section-primaire',
    source: 'RESPONSABILITE_CLASSE',
  }]);
  assert.equal(corps.tenantHeader, 'ecole-1');
  assert.equal(corps.organisationHeader, 'org-1');

  const usurpationIdentite = await serveur.inject({
    method: 'GET',
    url: '/probe',
    headers: {
      authorization: `Bearer ${accessToken}`,
      'x-session-id': session.obtenirId(),
      'x-user-id': 'utilisateur-etranger',
    },
  });
  assert.equal(usurpationIdentite.statusCode, 403, usurpationIdentite.body);
  assert.equal(usurpationIdentite.json().code, 'IDENTITY_CONTEXT_MISMATCH');

  await serveur.close();
});

test('tenancy refuse une ecole etrangere quand le contexte actif est deja etabli', async () => {
  const authRepositories = creerRepositoriesAuthMemoire();
  const securityRepositories = creerRepositoriesSecurityMemoire();

  const utilisateur = creerUtilisateurAuth({
    email: 'tenant@test.cd',
  });
  const refreshToken = creerRefreshToken(utilisateur.obtenirId(), 'hash-refresh-2');
  const session = creerSessionUtilisateur({
    idUtilisateur: utilisateur.obtenirId(),
    refreshTokenId: refreshToken.obtenirId(),
    organisationActiveId: 'org-1',
    ecoleActiveId: 'ecole-1',
  });

  await authRepositories.depotUtilisateurAuth.sauvegarder(utilisateur);
  await authRepositories.depotRefreshToken.sauvegarder(refreshToken);
  await authRepositories.depotSessionUtilisateur.sauvegarder(session);
  await authRepositories.depotContexteActifAuth.sauvegarder(
    creerContexteActifAuth(utilisateur.obtenirId(), 'org-1', 'ecole-1'),
  );

  const role = creerRole({
    codeRole: 'CAISSIER',
    permissions: ['paiements.read'],
  });
  await securityRepositories.roleRepository.sauvegarder(role);
  await securityRepositories.affectationRepository.sauvegarder(
    creerAffectationUtilisateur({
      idUtilisateur: utilisateur.obtenirId(),
      idRole: role.obtenirId(),
      idOrganisation: 'org-1',
      idEcole: 'ecole-1',
    }),
  );

  const jwt = new JwtTokenAdapter();
  const accessToken = await jwt.genererJwt({
    sub: utilisateur.obtenirId(),
    sid: session.obtenirId(),
    email: utilisateur.obtenirEmail().obtenirValeur(),
    tokenVersion: utilisateur.obtenirTokenVersion().obtenirValeur(),
    organisationActiveId: 'org-1',
    ecoleActiveId: 'ecole-1',
  });

  const serveur = Fastify();
  await serveur.register(async (instance) => {
    await requestContextPlugin(instance, {});
    await creerAuthenticationPlugin({
      jwtTokenAdapter: jwt,
      utilisateurAuthRepository: authRepositories.depotUtilisateurAuth,
      contexteActifAuthRepository: authRepositories.depotContexteActifAuth,
      sessionApplicationService: new SessionApplicationService(
        authRepositories.depotSessionUtilisateur,
        authRepositories.depotRefreshToken,
        new SessionCacheService(),
      ),
    })(instance, {});
    await creerSecurityPlugin({
      roleRepository: securityRepositories.roleRepository,
      affectationUtilisateurRepository: securityRepositories.affectationRepository,
      affectationTitulariatRepository: securityRepositories.titulariatRepository,
      auditSecurityPort: null,
      ownershipParentPort: null,
      responsabiliteClassePedagogiquePort: null,
    })(instance, {});
    await tenancyPlugin(instance, {});
    instance.get('/probe', async () => ({ ok: true }));
  });

  const reponse = await serveur.inject({
    method: 'GET',
    url: '/probe',
    headers: {
      authorization: `Bearer ${accessToken}`,
      'x-session-id': session.obtenirId(),
      'x-tenant-id': 'ecole-etrangere',
    },
  });

  assert.equal(reponse.statusCode, 403, reponse.body);

  await serveur.close();
});
