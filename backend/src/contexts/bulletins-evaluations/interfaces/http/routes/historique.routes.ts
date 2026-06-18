import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesBulletinsEvaluationsDocument } from './DependancesRoutesBulletinsEvaluations';
import { executerRouteBulletin } from './outilsRoutesBulletins';

// Ce fichier declare les routes HTTP d'historique et de snapshots.
export const creerHistoriqueRoutes = (
  dependances: DependancesRoutesBulletinsEvaluationsDocument,
): FastifyPluginAsync => async (serveur) => {
  serveur.get('/historique/bulletins/:idBulletinEleve', (requete, reponse) =>
    executerRouteBulletin(requete, reponse, () => dependances.historiqueBulletinController.consulterHistoriqueBulletins(requete.params, requete.headers), dependances.contexteTenant));
  serveur.get('/historique/proclamations', (requete, reponse) =>
    executerRouteBulletin(requete, reponse, () => dependances.historiqueBulletinController.consulterHistoriqueProclamations(requete.query), dependances.contexteTenant));
  serveur.get('/historique/snapshots', (requete, reponse) =>
    executerRouteBulletin(requete, reponse, () => dependances.historiqueBulletinController.consulterSnapshots(requete.query), dependances.contexteTenant));
};
