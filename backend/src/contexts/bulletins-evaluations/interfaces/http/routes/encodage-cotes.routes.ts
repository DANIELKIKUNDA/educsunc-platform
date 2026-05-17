import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesBulletinsEvaluationsDocument } from './DependancesRoutesBulletinsEvaluations';
import { executerRouteBulletin } from './outilsRoutesBulletins';

// Ce fichier declare les routes HTTP d'encodage des cotes.
export const creerEncodageCotesRoutes = (
  dependances: DependancesRoutesBulletinsEvaluationsDocument,
): FastifyPluginAsync => async (serveur) => {
  serveur.post('/cotes', (requete, reponse) =>
    executerRouteBulletin(requete, reponse, () => dependances.encodageCotesController.encoder(requete.body, requete.headers), dependances.contexteTenant, 201));
  serveur.put('/cotes/:idFicheCotationEleveCours', (requete, reponse) =>
    executerRouteBulletin(requete, reponse, () => dependances.encodageCotesController.modifier(requete.params, requete.body, requete.headers), dependances.contexteTenant));
  serveur.delete('/cotes/:idFicheCotationEleveCours', (requete, reponse) =>
    executerRouteBulletin(requete, reponse, () => dependances.encodageCotesController.supprimer(requete.params, requete.body, requete.headers), dependances.contexteTenant));
};
