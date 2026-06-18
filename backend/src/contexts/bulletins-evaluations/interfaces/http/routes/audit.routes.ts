import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesBulletinsEvaluationsDocument } from './DependancesRoutesBulletinsEvaluations';
import { executerRouteBulletin } from './outilsRoutesBulletins';

// Ce fichier declare les routes HTTP d'audit du BC.
export const creerAuditRoutes = (
  dependances: DependancesRoutesBulletinsEvaluationsDocument,
): FastifyPluginAsync => async (serveur) => {
  serveur.get('/audit/cotes', (requete, reponse) =>
    executerRouteBulletin(
      requete,
      reponse,
      () => dependances.auditBulletinController.consulterAuditCotes(requete.query as never, requete.headers),
      dependances.contexteTenant,
    ));
  serveur.get('/audit/conduite', (requete, reponse) =>
    executerRouteBulletin(
      requete,
      reponse,
      () => dependances.auditBulletinController.consulterAuditConduite(requete.query as never, requete.headers),
      dependances.contexteTenant,
    ));
  serveur.get('/audit/bulletins', (requete, reponse) =>
    executerRouteBulletin(
      requete,
      reponse,
      () => dependances.auditBulletinController.consulterAuditBulletins(requete.query as never, requete.headers),
      dependances.contexteTenant,
    ));
  serveur.get('/audit/classements', (requete, reponse) =>
    executerRouteBulletin(
      requete,
      reponse,
      () => dependances.auditBulletinController.consulterAuditClassements(requete.query as never, requete.headers),
      dependances.contexteTenant,
    ));
};
