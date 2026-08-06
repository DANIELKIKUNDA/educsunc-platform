import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesBulletinsEvaluationsDocument } from './DependancesRoutesBulletinsEvaluations';
import { executerRouteBulletin } from './outilsRoutesBulletins';

// Ce fichier declare les routes HTTP de consultation et recalcul des classements.
export const creerClassementsRoutes = (
  dependances: DependancesRoutesBulletinsEvaluationsDocument,
): FastifyPluginAsync => async (serveur) => {
  serveur.get('/classements/classe/:idClassePedagogique', (requete, reponse) =>
    executerRouteBulletin(
      requete,
      reponse,
      () => dependances.classementsController.consulter(
        { ...(requete.params as object), ...(requete.query as object) },
        requete.headers,
      ),
      dependances.contexteTenant,
    ));
  serveur.post('/classements/recalcul', (requete, reponse) =>
    executerRouteBulletin(
      requete,
      reponse,
      () => dependances.classementsController.recalculer(requete.body, requete.headers),
      dependances.contexteTenant,
    ));
};
