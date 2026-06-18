import test from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import { RequestContextFactory } from 'shared/context';
import { creerRoutesOrganisations } from '../interfaces/http/routes/organisations.routes';

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
