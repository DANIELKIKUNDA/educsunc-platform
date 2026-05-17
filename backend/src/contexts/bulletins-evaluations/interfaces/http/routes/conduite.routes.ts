import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesBulletinsEvaluationsDocument } from './DependancesRoutesBulletinsEvaluations';
import { executerRouteBulletin } from './outilsRoutesBulletins';

// Ce fichier declare les routes HTTP de conduite et application.
export const creerConduiteRoutes = (
  dependances: DependancesRoutesBulletinsEvaluationsDocument,
): FastifyPluginAsync => async (serveur) => {
  serveur.post('/conduite', (requete, reponse) =>
    executerRouteBulletin(requete, reponse, () => dependances.conduiteApplicationController.encoder(requete.body, requete.headers), dependances.contexteTenant));
  serveur.get('/conduite/:idEleve', (requete, reponse) =>
    executerRouteBulletin(requete, reponse, () => dependances.conduiteApplicationController.consulterConduite(), dependances.contexteTenant));
  serveur.get('/application/:idEleve', (requete, reponse) =>
    executerRouteBulletin(requete, reponse, () => dependances.conduiteApplicationController.consulterApplication(), dependances.contexteTenant));
};
