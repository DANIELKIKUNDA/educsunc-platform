import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesBulletinsEvaluationsDocument } from './DependancesRoutesBulletinsEvaluations';
import { executerRouteBulletin } from './outilsRoutesBulletins';

// Ce fichier declare les routes HTTP de migration des bulletins.
export const creerMigrationsRoutes = (
  dependances: DependancesRoutesBulletinsEvaluationsDocument,
): FastifyPluginAsync => async (serveur) => {
  serveur.post('/migrations/analyser', (requete, reponse) =>
    executerRouteBulletin(requete, reponse, () => dependances.migrationBulletinController.analyser(requete.body, requete.headers), dependances.contexteTenant, 201));
  serveur.post('/migrations/appliquer', (requete, reponse) =>
    executerRouteBulletin(requete, reponse, () => dependances.migrationBulletinController.appliquer(requete.body, requete.headers), dependances.contexteTenant));
  serveur.get('/migrations', (requete, reponse) =>
    executerRouteBulletin(requete, reponse, () => dependances.migrationBulletinController.lister(requete.query as never), dependances.contexteTenant));
};
