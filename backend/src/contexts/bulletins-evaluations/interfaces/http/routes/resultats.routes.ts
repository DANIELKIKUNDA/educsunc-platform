import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesBulletinsEvaluationsDocument } from './DependancesRoutesBulletinsEvaluations';
import { executerRouteBulletin } from './outilsRoutesBulletins';

// Ce fichier declare les routes HTTP de lecture des resultats.
export const creerResultatsRoutes = (
  dependances: DependancesRoutesBulletinsEvaluationsDocument,
): FastifyPluginAsync => async (serveur) => {
  serveur.get('/resultats/echecs', (requete, reponse) =>
    executerRouteBulletin(requete, reponse, () => dependances.resultatsBulletinController.consulterEchecs(requete.query, requete.headers), dependances.contexteTenant));
  serveur.get('/resultats/echecs-profonds', (requete, reponse) =>
    executerRouteBulletin(requete, reponse, () => dependances.resultatsBulletinController.consulterEchecsProfonds(requete.query, requete.headers), dependances.contexteTenant));
  serveur.get('/resultats/cours-problematiques', (requete, reponse) =>
    executerRouteBulletin(requete, reponse, () => dependances.resultatsBulletinController.consulterCoursProblematiques(requete.query, requete.headers), dependances.contexteTenant));
  serveur.get('/resultats/comparatif-classes', (requete, reponse) =>
    executerRouteBulletin(requete, reponse, () => dependances.resultatsBulletinController.consulterComparatifClasses(requete.query, requete.headers), dependances.contexteTenant));
  serveur.get('/resultats/evolution/:idEleve/:idAnneeScolaire', (requete, reponse) =>
    executerRouteBulletin(requete, reponse, () => dependances.resultatsBulletinController.consulterEvolution(requete.params, requete.query, requete.headers), dependances.contexteTenant));
  serveur.get('/resultats/perequation', (requete, reponse) =>
    executerRouteBulletin(requete, reponse, () => dependances.resultatsBulletinController.consulterPerequation(requete.query, requete.headers), dependances.contexteTenant));
  serveur.get('/resultats/repechage', (requete, reponse) =>
    executerRouteBulletin(requete, reponse, () => dependances.resultatsBulletinController.consulterRepechage(requete.query, requete.headers), dependances.contexteTenant));
  serveur.get('/resultats/deliberation', (requete, reponse) =>
    executerRouteBulletin(requete, reponse, () => dependances.resultatsBulletinController.consulterDeliberation(requete.query, requete.headers), dependances.contexteTenant));
  serveur.get('/resultats/seconde-session', (requete, reponse) =>
    executerRouteBulletin(requete, reponse, () => dependances.resultatsBulletinController.consulterSecondeSession(requete.query, requete.headers), dependances.contexteTenant));
  serveur.get('/resultats/non-classes', (requete, reponse) =>
    executerRouteBulletin(requete, reponse, () => dependances.resultatsBulletinController.consulterNonClasses(requete.query, requete.headers), dependances.contexteTenant));
  serveur.get('/resultats/diagnostics', (requete, reponse) =>
    executerRouteBulletin(requete, reponse, () => dependances.resultatsBulletinController.consulterDiagnostics(requete.query, requete.headers), dependances.contexteTenant));
  serveur.get('/resultats/:idEleve/:idAnneeScolaire', (requete, reponse) =>
    executerRouteBulletin(requete, reponse, () => dependances.resultatsBulletinController.consulterResultat(requete.params, requete.headers), dependances.contexteTenant));
};
