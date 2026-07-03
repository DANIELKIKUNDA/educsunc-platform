import test from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import { RequestContextFactory } from 'shared/context';
import { creerRoutesOrganisations } from '../interfaces/http/routes/organisations.routes';
import { ErreurAccesRefuse } from '../../../shared/security/application/exceptions/ErreurAccesRefuse';

test('les routes organisations transmettent le contexte authentifie et n exposent plus creePar ou modifiePar comme saisie libre', async () => {
  const serveur = Fastify();
  const appels: string[] = [];

  serveur.addHook('onRequest', async (requete) => {
    requete.context = RequestContextFactory.creerContexteInitial({ requestId: 'req-org-01' });
    requete.context = RequestContextFactory.enrichirAuth(requete.context, {
      utilisateurId: 'user-manager',
      roleActif: 'MANAGER_SYSTEME',
      organisationActiveId: 'org-a',
      ecoleActiveId: 'ecole-a-1',
    });
  });

  await serveur.register(creerRoutesOrganisations({
    controleurOrganisations: {
      async creerOrganisation(_body: unknown, context: { utilisateurId?: string }) {
        appels.push(`creer:${context.utilisateurId ?? 'none'}`);
        return { donnee: { id: 'org-1' } };
      },
      async listerOrganisations(_query: unknown, context: { utilisateurId?: string }) {
        appels.push(`liste:${context.utilisateurId ?? 'none'}`);
        return { donnees: [], pagination: { total: 0, page: 1, taillePage: 20, totalPages: 0 } };
      },
      async consulterOrganisation(_params: unknown, context: { utilisateurId?: string }) {
        appels.push(`consultation:${context.utilisateurId ?? 'none'}`);
        return { donnee: { id: 'org-1' } };
      },
      async renommerOrganisation(_params: unknown, _body: unknown, context: { utilisateurId?: string }) {
        appels.push(`renommer:${context.utilisateurId ?? 'none'}`);
        return { donnee: { id: 'org-1' } };
      },
      async activerOrganisation(_params: unknown, _body: unknown, context: { utilisateurId?: string }) {
        appels.push(`activer:${context.utilisateurId ?? 'none'}`);
        return { donnee: { id: 'org-1' } };
      },
      async desactiverOrganisation(_params: unknown, _body: unknown, context: { utilisateurId?: string }) {
        appels.push(`desactiver:${context.utilisateurId ?? 'none'}`);
        return { donnee: { id: 'org-1' } };
      },
    } as never,
    executerRouteTenant: async (_requete, operation) => operation(),
  }));

  const reponseCreation = await serveur.inject({
    method: 'POST',
    url: '/api/organisations',
    payload: {
      code: 'ORG-A',
      nom: 'Organisation A',
      typeOrganisation: 'PRIVEE',
    },
  });
  const reponseRenommage = await serveur.inject({
    method: 'PATCH',
    url: '/api/organisations/org-a/renommer',
    payload: {
      nouveauNom: 'Organisation Renommee',
    },
  });

  assert.equal(reponseCreation.statusCode, 200, reponseCreation.body);
  assert.equal(reponseRenommage.statusCode, 200, reponseRenommage.body);
  assert.deepEqual(appels, ['creer:user-manager', 'renommer:user-manager']);

  await serveur.close();
});

test('les routes organisations repondent 401 sans utilisateur courant', async () => {
  const serveur = Fastify();

  serveur.addHook('onRequest', async (requete) => {
    requete.context = RequestContextFactory.creerContexteInitial({ requestId: 'req-org-02' });
  });

  await serveur.register(creerRoutesOrganisations({
    controleurOrganisations: {
      async listerOrganisations() {
        throw new Error('Ne doit pas etre appele sans authentification.');
      },
    } as never,
    executerRouteTenant: async (_requete, operation) => operation(),
  }));

  const reponse = await serveur.inject({
    method: 'GET',
    url: '/api/organisations',
  });

  assert.equal(reponse.statusCode, 401, reponse.body);
  assert.match(reponse.body, /REFERENTIEL_AUTH_REQUIRED/);

  await serveur.close();
});

test('les routes organisations traduisent un refus d acces en 403', async () => {
  const serveur = Fastify();

  serveur.addHook('onRequest', async (requete) => {
    requete.context = RequestContextFactory.creerContexteInitial({ requestId: 'req-org-03' });
    requete.context = RequestContextFactory.enrichirAuth(requete.context, {
      utilisateurId: 'user-operateur',
      roleActif: 'OPERATEUR_SYSTEME',
    });
  });

  await serveur.register(creerRoutesOrganisations({
    controleurOrganisations: {
      async listerOrganisations() {
        throw new ErreurAccesRefuse("L'acteur courant n'est pas autorise a administrer les organisations.");
      },
    } as never,
    executerRouteTenant: async (_requete, operation) => operation(),
  }));

  const reponse = await serveur.inject({
    method: 'GET',
    url: '/api/organisations',
  });

  assert.equal(reponse.statusCode, 403, reponse.body);
  assert.match(reponse.body, /REFERENTIEL_FORBIDDEN/);

  await serveur.close();
});
