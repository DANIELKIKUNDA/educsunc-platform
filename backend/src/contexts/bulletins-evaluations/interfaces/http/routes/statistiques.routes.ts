import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesBulletinsEvaluationsDocument } from './DependancesRoutesBulletinsEvaluations';
import { executerRouteBulletin } from './outilsRoutesBulletins';

// Ce fichier declare les routes HTTP de statistiques du BC.
export const creerStatistiquesRoutes = (
  dependances: DependancesRoutesBulletinsEvaluationsDocument,
): FastifyPluginAsync => async (serveur) => {
  serveur.get('/statistiques/classes', (requete, reponse) =>
    executerRouteBulletin(requete, reponse, () => dependances.statistiquesBulletinController.consulterClasses(requete.query, requete.headers), dependances.contexteTenant));
  serveur.get('/statistiques/ecole', (requete, reponse) =>
    executerRouteBulletin(requete, reponse, () => dependances.statistiquesBulletinController.consulterEcole(requete.query, requete.headers), dependances.contexteTenant));
  serveur.get('/statistiques/non-classes', (requete, reponse) =>
    executerRouteBulletin(requete, reponse, () => dependances.statistiquesBulletinController.consulterNonClasses(requete.query, requete.headers), dependances.contexteTenant));
  serveur.get('/statistiques/abandons', (requete, reponse) =>
    executerRouteBulletin(requete, reponse, () => dependances.statistiquesBulletinController.consulterAbandons(requete.query, requete.headers), dependances.contexteTenant));
};
