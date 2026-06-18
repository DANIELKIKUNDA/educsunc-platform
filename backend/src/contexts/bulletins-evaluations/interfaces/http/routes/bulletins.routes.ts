import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesBulletinsEvaluationsDocument } from './DependancesRoutesBulletinsEvaluations';
import { executerRouteBulletin } from './outilsRoutesBulletins';

// Ce fichier declare les routes HTTP des bulletins eleves.
export const creerBulletinsRoutes = (
  dependances: DependancesRoutesBulletinsEvaluationsDocument,
): FastifyPluginAsync => async (serveur) => {
  serveur.post('/bulletins/generer', (requete, reponse) =>
    executerRouteBulletin(requete, reponse, () => dependances.bulletinsController.generer(requete.body, requete.headers), dependances.contexteTenant, 201));
  serveur.get('/bulletins/:idEleve/:idAnneeScolaire', (requete, reponse) =>
    executerRouteBulletin(requete, reponse, () => dependances.bulletinsController.consulter(requete.params, requete.headers), dependances.contexteTenant));
  serveur.get('/bulletins/:idEleve/:idAnneeScolaire/pdf', (requete, reponse) =>
    executerRouteBulletin(requete, reponse, () => dependances.bulletinsController.telechargerPdf(requete.params, requete.headers), dependances.contexteTenant));
  serveur.get('/bulletins/:idBulletinEleve/historique', (requete, reponse) =>
    executerRouteBulletin(requete, reponse, () => dependances.bulletinsController.consulterHistorique(requete.params, requete.headers), dependances.contexteTenant));
};
