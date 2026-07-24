import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesBulletinsEvaluationsDocument } from './DependancesRoutesBulletinsEvaluations';
import { executerRouteBulletin } from './outilsRoutesBulletins';

// Ce fichier declare les routes HTTP des proclamations.
export const creerProclamationsRoutes = (
  dependances: DependancesRoutesBulletinsEvaluationsDocument,
): FastifyPluginAsync => async (serveur) => {
  serveur.post('/proclamations/initialiser', (requete, reponse) =>
    executerRouteBulletin(requete, reponse, () => dependances.proclamationsController.initialiser(requete.body, requete.headers), dependances.contexteTenant, 201));
  serveur.post('/proclamations/generer', (requete, reponse) =>
    executerRouteBulletin(requete, reponse, () => dependances.proclamationsController.generer(requete.body, requete.headers), dependances.contexteTenant, 201));
  serveur.get('/proclamations/classe/:idClassePedagogique', (requete, reponse) =>
    executerRouteBulletin(requete, reponse, () => dependances.proclamationsController.consulter({ ...(requete.params as object), ...(requete.query as object) }), dependances.contexteTenant));
  serveur.get('/proclamations/classe/:idClassePedagogique/pdf', (requete, reponse) =>
    executerRouteBulletin(requete, reponse, () => dependances.proclamationsController.telechargerPdf({ ...(requete.params as object), ...(requete.query as object) }), dependances.contexteTenant));
};
