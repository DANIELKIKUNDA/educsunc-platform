import test from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import { creerResultatsRoutes } from 'contexts/bulletins-evaluations/interfaces/http/routes/resultats.routes';
import { ContexteTenant } from 'shared/tenancy/TenantContext';

test('les routes resultats exposent le resultat consolide et les analyses de base', async () => {
  const serveur = Fastify();
  const contexteTenant = new ContexteTenant();

  await serveur.register(creerResultatsRoutes({
    resultatsBulletinController: {
      async consulterEchecs() { return { donnee: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } }; },
      async consulterEchecsProfonds() { return { donnee: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } }; },
      async consulterCoursProblematiques() { return { donnee: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } }; },
      async consulterComparatifClasses() { return { donnee: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } }; },
      async consulterEvolution() { return { donnee: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } }; },
      async consulterPerequation() { return { donnee: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } }; },
      async consulterRepechage() { return { donnee: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } }; },
      async consulterDeliberation() { return { donnee: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } }; },
      async consulterSecondeSession() { return { donnee: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } }; },
      async consulterResultat() { return { donnee: { type: 'resultat-consolide' } }; },
      async consulterNonClasses() { return { donnee: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } }; },
      async consulterDiagnostics() { return { donnee: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } }; },
    } as never,
    contexteTenant,
  } as never));

  assert.equal((await serveur.inject({
    method: 'GET',
    url: '/resultats/eleve-1/annee-1',
    headers: { 'x-tenant-id': 'ecole-1', 'x-user-id': 'user-1' },
  })).statusCode, 200);

  assert.equal((await serveur.inject({
    method: 'GET',
    url: '/resultats/echecs?idClassePedagogique=classe-1&idAnneeScolaire=annee-1&codeColonne=TOTAL_GENERAL',
    headers: { 'x-tenant-id': 'ecole-1', 'x-user-id': 'user-1' },
  })).statusCode, 200);

  assert.equal((await serveur.inject({
    method: 'GET',
    url: '/resultats/echecs-profonds?idClassePedagogique=classe-1&idAnneeScolaire=annee-1&codeColonne=TOTAL_GENERAL',
    headers: { 'x-tenant-id': 'ecole-1', 'x-user-id': 'user-1' },
  })).statusCode, 200);

  assert.equal((await serveur.inject({
    method: 'GET',
    url: '/resultats/cours-problematiques?idClassePedagogique=classe-1&idAnneeScolaire=annee-1&codeColonne=TOTAL_GENERAL',
    headers: { 'x-tenant-id': 'ecole-1', 'x-user-id': 'user-1' },
  })).statusCode, 200);

  assert.equal((await serveur.inject({
    method: 'GET',
    url: '/resultats/comparatif-classes?idClassesPedagogiques=classe-1,classe-2&idAnneeScolaire=annee-1&codeColonne=TOTAL_GENERAL',
    headers: { 'x-tenant-id': 'ecole-1', 'x-user-id': 'user-1' },
  })).statusCode, 200);

  assert.equal((await serveur.inject({
    method: 'GET',
    url: '/resultats/evolution/eleve-1/annee-1?codeColonne=TOTAL_GENERAL',
    headers: { 'x-tenant-id': 'ecole-1', 'x-user-id': 'user-1' },
  })).statusCode, 200);

  assert.equal((await serveur.inject({
    method: 'GET',
    url: '/resultats/perequation?idClassePedagogique=classe-1&idAnneeScolaire=annee-1&codeColonne=TOTAL_GENERAL',
    headers: { 'x-tenant-id': 'ecole-1', 'x-user-id': 'user-1' },
  })).statusCode, 200);

  assert.equal((await serveur.inject({
    method: 'GET',
    url: '/resultats/repechage?idClassePedagogique=classe-1&idAnneeScolaire=annee-1&codeColonne=TOTAL_GENERAL',
    headers: { 'x-tenant-id': 'ecole-1', 'x-user-id': 'user-1' },
  })).statusCode, 200);

  assert.equal((await serveur.inject({
    method: 'GET',
    url: '/resultats/deliberation?idClassePedagogique=classe-1&idAnneeScolaire=annee-1&codeColonne=TOTAL_GENERAL',
    headers: { 'x-tenant-id': 'ecole-1', 'x-user-id': 'user-1' },
  })).statusCode, 200);

  assert.equal((await serveur.inject({
    method: 'GET',
    url: '/resultats/seconde-session?idClassePedagogique=classe-1&idAnneeScolaire=annee-1&codeColonne=TOTAL_GENERAL',
    headers: { 'x-tenant-id': 'ecole-1', 'x-user-id': 'user-1' },
  })).statusCode, 200);

  assert.equal((await serveur.inject({
    method: 'GET',
    url: '/resultats/non-classes?idClassePedagogique=classe-1&idAnneeScolaire=annee-1&codeColonne=TOTAL_GENERAL',
    headers: { 'x-tenant-id': 'ecole-1', 'x-user-id': 'user-1' },
  })).statusCode, 200);

  assert.equal((await serveur.inject({
    method: 'GET',
    url: '/resultats/diagnostics?idEleve=eleve-1&idAnneeScolaire=annee-1',
    headers: { 'x-tenant-id': 'ecole-1', 'x-user-id': 'user-1' },
  })).statusCode, 200);

  await serveur.close();
});
