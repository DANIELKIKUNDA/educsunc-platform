import assert from 'node:assert/strict';
import test from 'node:test';
import Fastify from 'fastify';
import { RequestContextFactory } from '../../shared/context';
import { ScopeAcces, TypeScope } from '../../shared/security/domain';
import { requestContextPlugin } from '../plugins/request-context.plugin';
import { tenancyPlugin } from '../plugins/tenancy.plugin';

async function creerServeur(scopePlateforme: boolean) {
  const serveur = Fastify();
  await requestContextPlugin(serveur, {});
  serveur.addHook('preHandler', async (requete) => {
    requete.context = RequestContextFactory.enrichirAuth(requete.context, {
      utilisateurId: 'utilisateur-test',
      organisationActiveId: 'organisation-active',
      ecoleActiveId: 'ecole-active',
    });
    requete.context = RequestContextFactory.enrichirSecurity(requete.context, {
      roleActif: scopePlateforme ? 'MANAGER_SYSTEME' : 'PROMOTEUR_ORGANISATION',
      scopes: scopePlateforme
        ? [ScopeAcces.creer(new TypeScope('PLATEFORME'), 'system')]
        : [ScopeAcces.creer(new TypeScope('ORGANISATION'), 'organisation-active')],
    });
  });
  await tenancyPlugin(serveur, {});
  serveur.get('/preuve', async (requete) => ({
    organisation: requete.headers['x-organisation-id'],
    ecole: requete.headers['x-tenant-id'],
  }));
  return serveur;
}

test('le pilotage plateforme conserve le perimetre explicitement demande', async () => {
  const serveur = await creerServeur(true);
  try {
    const reponse = await serveur.inject({
      method: 'GET',
      url: '/preuve',
      headers: {
        'x-organisation-id': 'organisation-consultee',
        'x-tenant-id': 'ecole-consultee',
      },
    });
    assert.equal(reponse.statusCode, 200);
    assert.deepEqual(reponse.json(), {
      organisation: 'organisation-consultee',
      ecole: 'ecole-consultee',
    });
  } finally {
    await serveur.close();
  }
});

test('un acteur organisation reste limite a son organisation active', async () => {
  const serveur = await creerServeur(false);
  try {
    const reponse = await serveur.inject({
      method: 'GET',
      url: '/preuve',
      headers: { 'x-organisation-id': 'organisation-interdite' },
    });
    assert.equal(reponse.statusCode, 403);
  } finally {
    await serveur.close();
  }
});
