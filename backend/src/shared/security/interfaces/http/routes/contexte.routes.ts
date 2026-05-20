import type { FastifyPluginAsync, FastifyReply } from 'fastify';
import { SecurityErrorPresenter } from '../presenters';
import type { DependancesRoutesSecurity } from './DependancesRoutesSecurity';

// Ce fichier enregistre les routes HTTP du contexte actif SECURITY.
export const creerContexteRoutes = (dependances: DependancesRoutesSecurity): FastifyPluginAsync => async (serveur) => {
  const executer = async (reponse: FastifyReply, operation: () => Promise<{ donnee: unknown }>, statutSucces = 200) => {
    try {
      const resultat = await operation();
      return reponse.code(statutSucces).send(resultat.donnee);
    } catch (erreur) {
      const presentee = SecurityErrorPresenter.presenterErreur(erreur);
      return reponse.code(presentee.statutHttp).send(presentee.corps);
    }
  };

  serveur.patch('/security/context/organisation', (requete, reponse) =>
    executer(reponse, () => dependances.contexteActifController.changerOrganisation(requete.body)));
  serveur.patch('/security/context/ecole', (requete, reponse) =>
    executer(reponse, () => dependances.contexteActifController.changerEcole(requete.body)));
  serveur.get('/security/context/:idUtilisateur', (requete, reponse) =>
    executer(reponse, () => dependances.contexteActifController.obtenir((requete.params as Record<string, string>).idUtilisateur)));
};
