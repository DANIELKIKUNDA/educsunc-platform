import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesBulletinsEvaluationsDocument } from './DependancesRoutesBulletinsEvaluations';
import { executerRouteBulletin } from './outilsRoutesBulletins';

// Ce fichier declare les routes HTTP d'export du BC.
export const creerExportsRoutes = (
  dependances: DependancesRoutesBulletinsEvaluationsDocument,
): FastifyPluginAsync => async (serveur) => {
  serveur.get('/exports/bulletins', (requete, reponse) =>
    executerRouteBulletin(requete, reponse, () => dependances.exportsBulletinController.exporterBulletins(requete.query), dependances.contexteTenant));
  serveur.get('/exports/proclamations', (requete, reponse) =>
    executerRouteBulletin(requete, reponse, () => dependances.exportsBulletinController.exporterProclamations(requete.query), dependances.contexteTenant));
  serveur.get('/exports/statistiques', (requete, reponse) =>
    executerRouteBulletin(requete, reponse, () => dependances.exportsBulletinController.exporterStatistiques(requete.query as never), dependances.contexteTenant));
};
