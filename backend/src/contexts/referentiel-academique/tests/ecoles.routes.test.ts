import test from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import { RequestContextFactory } from 'shared/context';
import { ErreurAccesRefuse } from '../../../shared/security/application/exceptions/ErreurAccesRefuse';
import { creerRoutesEcoles } from '../interfaces/http/routes/ecoles.routes';

test('les routes ecoles transmettent le contexte authentifie et n exposent plus creePar ou modifiePar comme saisie libre', async () => {
  const serveur = Fastify();
  const appels: string[] = [];

  serveur.addHook('onRequest', async (requete) => {
    requete.context = RequestContextFactory.creerContexteInitial({ requestId: 'req-adm-01' });
    requete.context = RequestContextFactory.enrichirAuth(requete.context, {
      utilisateurId: 'user-manager',
      roleActif: 'MANAGER_SYSTEME',
      organisationActiveId: 'org-a',
      ecoleActiveId: 'ecole-a-1',
    });
  });

  await serveur.register(creerRoutesEcoles({
    controleurEcoles: {
      async creerEcole(_body: unknown, context: { utilisateurId?: string }) {
        appels.push(`creer:${context.utilisateurId ?? 'none'}`);
        return { donnee: { id: 'ecole-1' } };
      },
      async listerEcoles(_query: unknown, context: { utilisateurId?: string }) {
        appels.push(`liste:${context.utilisateurId ?? 'none'}`);
        return { donnees: [], pagination: { total: 0, page: 1, taillePage: 20, totalPages: 0 } };
      },
      async consulterEcole(_params: unknown, context: { utilisateurId?: string }) {
        appels.push(`consultation:${context.utilisateurId ?? 'none'}`);
        return { donnee: { id: 'ecole-1' } };
      },
      async listerEcolesParOrganisation(
        _params: unknown,
        _query: unknown,
        context: { utilisateurId?: string },
      ) {
        appels.push(`liste-organisation:${context.utilisateurId ?? 'none'}`);
        return { donnees: [], pagination: { total: 0, page: 1, taillePage: 20, totalPages: 0 } };
      },
      async changerModeExploitationEcole(
        _params: unknown,
        _body: unknown,
        context: { utilisateurId?: string },
      ) {
        appels.push(`mode:${context.utilisateurId ?? 'none'}`);
        return { donnee: { id: 'ecole-1' } };
      },
      async renommerEcole(_params: unknown, _body: unknown, context: { utilisateurId?: string }) {
        appels.push(`renommer:${context.utilisateurId ?? 'none'}`);
        return { donnee: { id: 'ecole-1' } };
      },
      async mettreAJourInformationsInstitutionnellesEcole(
        _params: unknown,
        _body: unknown,
        context: { utilisateurId?: string },
      ) {
        appels.push(`institutionnel:${context.utilisateurId ?? 'none'}`);
        return { donnee: { id: 'ecole-1' } };
      },
      async activerEcole(_params: unknown, _body: unknown, context: { utilisateurId?: string }) {
        appels.push(`activer:${context.utilisateurId ?? 'none'}`);
        return { donnee: { id: 'ecole-1' } };
      },
      async desactiverEcole(_params: unknown, _body: unknown, context: { utilisateurId?: string }) {
        appels.push(`desactiver:${context.utilisateurId ?? 'none'}`);
        return { donnee: { id: 'ecole-1' } };
      },
    } as never,
    executerRouteTenant: async (_requete, operation) => operation(),
  }));

  const reponseCreation = await serveur.inject({
    method: 'POST',
    url: '/api/ecoles',
    payload: {
      idOrganisation: 'org-a',
      code: 'ECOLE-A1',
      nom: 'Ecole A1',
      modeExploitation: 'HOMOLOGUEE',
    },
  });
  const reponseRenommage = await serveur.inject({
    method: 'PATCH',
    url: '/api/ecoles/ecole-a-1/renommer',
    payload: {
      nouveauNom: 'Ecole Renommee',
    },
  });
  const reponseInformationsInstitutionnelles = await serveur.inject({
    method: 'PATCH',
    url: '/api/ecoles/ecole-a-1/informations-institutionnelles',
    payload: {
      provinceEducationnelle: 'Haut-Katanga 1',
      ville: 'Lubumbashi',
      communeOuTerritoire: 'Lubumbashi',
    },
  });

  assert.equal(reponseCreation.statusCode, 200, reponseCreation.body);
  assert.equal(reponseRenommage.statusCode, 200, reponseRenommage.body);
  assert.equal(
    reponseInformationsInstitutionnelles.statusCode,
    200,
    reponseInformationsInstitutionnelles.body,
  );
  assert.deepEqual(appels, [
    'creer:user-manager',
    'renommer:user-manager',
    'institutionnel:user-manager',
  ]);

  await serveur.close();
});

test('les routes ecoles repondent 401 sans utilisateur courant', async () => {
  const serveur = Fastify();

  serveur.addHook('onRequest', async (requete) => {
    requete.context = RequestContextFactory.creerContexteInitial({ requestId: 'req-adm-02' });
  });

  await serveur.register(creerRoutesEcoles({
    controleurEcoles: {
      async listerEcoles() {
        throw new Error('Ne doit pas etre appele sans authentification.');
      },
    } as never,
    executerRouteTenant: async (_requete, operation) => operation(),
  }));

  const reponse = await serveur.inject({
    method: 'GET',
    url: '/api/ecoles',
  });

  assert.equal(reponse.statusCode, 401, reponse.body);
  assert.match(reponse.body, /REFERENTIEL_AUTH_REQUIRED/);

  await serveur.close();
});

test('les routes ecoles traduisent un refus d acces en 403', async () => {
  const serveur = Fastify();

  serveur.addHook('onRequest', async (requete) => {
    requete.context = RequestContextFactory.creerContexteInitial({ requestId: 'req-adm-03' });
    requete.context = RequestContextFactory.enrichirAuth(requete.context, {
      utilisateurId: 'user-support',
      roleActif: 'SUPPORT_SYSTEME',
    });
  });

  await serveur.register(creerRoutesEcoles({
    controleurEcoles: {
      async listerEcoles() {
        throw new ErreurAccesRefuse("L'acteur courant n'est pas autorise a administrer le socle academique officiel.");
      },
    } as never,
    executerRouteTenant: async (_requete, operation) => operation(),
  }));

  const reponse = await serveur.inject({
    method: 'GET',
    url: '/api/ecoles',
  });

  assert.equal(reponse.statusCode, 403, reponse.body);
  assert.match(reponse.body, /REFERENTIEL_FORBIDDEN/);

  await serveur.close();
});
