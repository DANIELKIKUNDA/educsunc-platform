import type { FastifyPluginAsync, FastifyReply } from 'fastify';
import { SecurityErrorPresenter } from '../presenters';
import type { DependancesRoutesSecurity } from './DependancesRoutesSecurity';

// Ce fichier enregistre les routes HTTP de lecture d'audit SECURITY.
export const creerAuditRoutes = (dependances: DependancesRoutesSecurity): FastifyPluginAsync => async (serveur) => {
  const executer = async (reponse: FastifyReply, operation: () => Promise<{ donnee: unknown }>, statutSucces = 200) => {
    try {
      const resultat = await operation();
      return reponse.code(statutSucces).send(resultat.donnee);
    } catch (erreur) {
      const presentee = SecurityErrorPresenter.presenterErreur(erreur);
      return reponse.code(presentee.statutHttp).send(presentee.corps);
    }
  };

  serveur.get('/security/audit/logs', (_requete, reponse) =>
    executer(reponse, () => dependances.securiteAuditController.listerLogs()));
  serveur.get('/security/audit/refus', (_requete, reponse) =>
    executer(reponse, () => dependances.securiteAuditController.listerRefus()));
  serveur.get('/security/audit/access', (_requete, reponse) =>
    executer(reponse, () => dependances.securiteAuditController.listerAcces()));
};
