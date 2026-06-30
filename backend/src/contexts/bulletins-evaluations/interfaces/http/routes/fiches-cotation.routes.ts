import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesBulletinsEvaluationsDocument } from './DependancesRoutesBulletinsEvaluations';
import { executerRouteBulletin } from './outilsRoutesBulletins';

// Ce fichier declare les routes HTTP de lecture des fiches de cotation.
export const creerFichesCotationRoutes = (
  dependances: DependancesRoutesBulletinsEvaluationsDocument,
): FastifyPluginAsync => async (serveur) => {
  serveur.get('/fiches-cotation', (requete, reponse) =>
    executerRouteBulletin(requete, reponse, () => dependances.fichesCotationController.consulterListe(), dependances.contexteTenant));
  serveur.get('/fiches-cotation/:idFicheCotationEleveCours', (requete, reponse) =>
    executerRouteBulletin(requete, reponse, () => dependances.fichesCotationController.consulterParId(requete.params), dependances.contexteTenant));
  serveur.get('/fiches-cotation/classe/:classeId', (requete, reponse) =>
    executerRouteBulletin(
      requete,
      reponse,
      () => dependances.fichesCotationController.consulterParClasse(requete.params, requete.query, requete.headers),
      dependances.contexteTenant,
    ));
};
