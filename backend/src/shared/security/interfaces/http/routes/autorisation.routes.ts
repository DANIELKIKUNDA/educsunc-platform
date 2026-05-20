import type { FastifyPluginAsync, FastifyReply } from 'fastify';
import { SecurityErrorPresenter } from '../presenters';
import type { DependancesRoutesSecurity } from './DependancesRoutesSecurity';

// Ce fichier enregistre les routes HTTP de verification SECURITY.
export const creerAutorisationRoutes = (dependances: DependancesRoutesSecurity): FastifyPluginAsync => async (serveur) => {
  const executer = async (reponse: FastifyReply, operation: () => Promise<{ donnee: unknown }>, statutSucces = 200) => {
    try {
      const resultat = await operation();
      return reponse.code(statutSucces).send(resultat.donnee);
    } catch (erreur) {
      const presentee = SecurityErrorPresenter.presenterErreur(erreur);
      return reponse.code(presentee.statutHttp).send(presentee.corps);
    }
  };

  serveur.post('/security/permissions/check', (requete, reponse) =>
    executer(reponse, () => dependances.autorisationController.verifierPermission(requete.body)));
  serveur.post('/security/scopes/check', (requete, reponse) =>
    executer(reponse, () => dependances.autorisationController.verifierScope(requete.body)));
  serveur.post('/security/restrictions/check', (requete, reponse) =>
    executer(reponse, () => dependances.autorisationController.verifierRestriction(requete.body)));
  serveur.post('/security/access/check', (requete, reponse) =>
    executer(reponse, () => dependances.autorisationController.verifierAcces(requete.body)));
};
