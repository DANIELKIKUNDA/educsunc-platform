import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesBulletinsEvaluationsDocument } from './DependancesRoutesBulletinsEvaluations';
import { executerRouteBulletin } from './outilsRoutesBulletins';

// Ce fichier declare les routes HTTP des syntheses de resultats.
export const creerSynthesesRoutes = (
  dependances: DependancesRoutesBulletinsEvaluationsDocument,
): FastifyPluginAsync => async (serveur) => {
  serveur.get('/syntheses/ecole/:idEcole', (requete, reponse) =>
    executerRouteBulletin(requete, reponse, () => dependances.syntheseResultatsController.consulter(Object.assign({}, requete.params as object, requete.query as object)), dependances.contexteTenant));
  serveur.post('/syntheses/generer', (requete, reponse) =>
    executerRouteBulletin(requete, reponse, () => dependances.syntheseResultatsController.generer(requete.body, requete.headers), dependances.contexteTenant, 201));
};
