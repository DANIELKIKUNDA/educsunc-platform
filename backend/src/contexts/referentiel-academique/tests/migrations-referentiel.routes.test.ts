import test from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import { RequestContextFactory } from 'shared/context';
import { creerRoutesMigrationsReferentiel } from '../interfaces/http/routes/migrations-referentiel.routes';

test('les routes de migration transmettent le contexte authentifie et exposent ACA-09', async () => {
  const serveur = Fastify();
  const appels: string[] = [];

  serveur.addHook('onRequest', async (requete) => {
    requete.context = RequestContextFactory.creerContexteInitial({ requestId: 'req-aca-09' });
    requete.context = RequestContextFactory.enrichirAuth(requete.context, {
      utilisateurId: 'user-manager',
      roleActif: 'MANAGER_SYSTEME',
      organisationActiveId: 'org-a',
      ecoleActiveId: 'ecole-a-1',
    });
  });

  await serveur.register(creerRoutesMigrationsReferentiel({
    controleurMigrationsReferentiel: {
      async listerMigrationsReferentielParProgrammeNiveau(
        _query: unknown,
        context: { utilisateurId?: string },
      ) {
        appels.push(`liste:${context.utilisateurId ?? 'none'}`);
        return {
          donnees: [],
          pagination: { total: 0, page: 1, taillePage: 20, totalPages: 0 },
        };
      },
      async analyserMigrationReferentiel(_body: unknown, context: { utilisateurId?: string }) {
        appels.push(`analyse:${context.utilisateurId ?? 'none'}`);
        return {
          donnee: { migrationReferentielProgramme: { id: 'mig-1' }, totalDifferences: 0, totalTransformationsNotes: 0 },
        };
      },
      async appliquerMigrationReferentiel(_body: unknown, context: { utilisateurId?: string }) {
        appels.push(`applique:${context.utilisateurId ?? 'none'}`);
        return { donnee: { migrationReferentielProgramme: { id: 'mig-1' }, programmeNiveau: { id: 'prog-1' } } };
      },
      async annulerMigrationReferentiel(
        _params: unknown,
        _body: unknown,
        context: { utilisateurId?: string },
      ) {
        appels.push(`annule:${context.utilisateurId ?? 'none'}`);
        return { donnee: { id: 'mig-1' } };
      },
      async relancerRecalculApresMigration(
        _params: unknown,
        _body: unknown,
        context: { utilisateurId?: string },
      ) {
        appels.push(`recalcul:${context.utilisateurId ?? 'none'}`);
        return { donnee: { id: 'mig-1' } };
      },
      async consulterRapportMigration(_params: unknown, context: { utilisateurId?: string }) {
        appels.push(`rapport:${context.utilisateurId ?? 'none'}`);
        return {
          donnee: { migrationReferentielProgramme: { id: 'mig-1' }, totalDifferences: 0, totalTransformationsNotes: 0 },
        };
      },
    } as never,
    executerRouteTenant: async (_requete, operation) => operation(),
    executerRouteIdempotente: async (_requete, operation) => operation(),
  }));

  const reponseListe = await serveur.inject({
    method: 'GET',
    url: '/api/migrations-referentiel?idProgrammeNiveau=prog-1&page=1&taillePage=20',
  });
  const reponseAnalyse = await serveur.inject({
    method: 'POST',
    url: '/api/migrations-referentiel/analyser',
    payload: {
      idProgrammeNiveau: 'prog-1',
      idAncienneVersionReferentiel: 'ver-1',
      idNouvelleVersionReferentiel: 'ver-2',
    },
  });

  assert.equal(reponseListe.statusCode, 200, reponseListe.body);
  assert.equal(reponseAnalyse.statusCode, 200, reponseAnalyse.body);
  assert.deepEqual(appels, ['liste:user-manager', 'analyse:user-manager']);

  await serveur.close();
});
