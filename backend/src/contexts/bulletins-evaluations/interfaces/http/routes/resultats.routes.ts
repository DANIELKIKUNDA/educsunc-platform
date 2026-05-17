import type { FastifyPluginAsync } from 'fastify';
import { QueryFilterValidator } from '../validators/QueryFilterValidator';
import type { DependancesRoutesBulletinsEvaluationsDocument } from './DependancesRoutesBulletinsEvaluations';
import { executerRouteBulletin } from './outilsRoutesBulletins';

// Ce fichier declare les routes HTTP de lecture des resultats.
export const creerResultatsRoutes = (
  dependances: DependancesRoutesBulletinsEvaluationsDocument,
): FastifyPluginAsync => async (serveur) => {
  serveur.get('/resultats/:idEleve/:idAnneeScolaire', (requete, reponse) =>
    executerRouteBulletin(requete, reponse, () => dependances.resultatsBulletinController.consulterResultat(requete.params), dependances.contexteTenant));
  serveur.get('/resultats/non-classes', (requete, reponse) =>
    executerRouteBulletin(requete, reponse, () => dependances.resultatsBulletinController.consulterNonClasses(QueryFilterValidator.valider(requete.query) as never), dependances.contexteTenant));
  serveur.get('/resultats/diagnostics', (requete, reponse) =>
    executerRouteBulletin(requete, reponse, () => dependances.resultatsBulletinController.consulterDiagnostics(QueryFilterValidator.valider(requete.query) as never), dependances.contexteTenant));
};
