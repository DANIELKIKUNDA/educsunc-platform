import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesBulletinsEvaluationsDocument } from './DependancesRoutesBulletinsEvaluations';
import { executerRouteBulletin } from './outilsRoutesBulletins';

// Ce fichier declare les routes HTTP de sante du BC.
export const creerHealthBulletinRoutes = (
  dependances: DependancesRoutesBulletinsEvaluationsDocument,
): FastifyPluginAsync => async (serveur) => {
  serveur.get('/api/bulletins/health', (requete, reponse) =>
    executerRouteBulletin(requete, reponse, () => dependances.healthBulletinController.consulterSante(), dependances.contexteTenant));
  serveur.get('/api/bulletins/health/projections', (requete, reponse) =>
    executerRouteBulletin(requete, reponse, () => dependances.healthBulletinController.consulterSanteProjections(), dependances.contexteTenant));
  serveur.get('/api/bulletins/health/sync', (requete, reponse) =>
    executerRouteBulletin(requete, reponse, () => dependances.healthBulletinController.consulterSanteSynchronisation(), dependances.contexteTenant));
};
