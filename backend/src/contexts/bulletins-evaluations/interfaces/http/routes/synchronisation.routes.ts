import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesBulletinsEvaluationsDocument } from './DependancesRoutesBulletinsEvaluations';
import { executerRouteBulletin } from './outilsRoutesBulletins';

// Ce fichier declare les routes HTTP de synchronisation offline.
export const creerSynchronisationRoutes = (
  dependances: DependancesRoutesBulletinsEvaluationsDocument,
): FastifyPluginAsync => async (serveur) => {
  serveur.post('/sync/replay', (requete, reponse) =>
    executerRouteBulletin(requete, reponse, () => dependances.synchronisationOfflineController.replay(requete.body), dependances.contexteTenant));
  serveur.post('/sync/conflits/resoudre', (requete, reponse) =>
    executerRouteBulletin(requete, reponse, () => dependances.synchronisationOfflineController.resoudreConflit(requete.body), dependances.contexteTenant));
  serveur.get('/sync/statut', (requete, reponse) =>
    executerRouteBulletin(requete, reponse, () => dependances.synchronisationOfflineController.consulterStatut(), dependances.contexteTenant));
};
