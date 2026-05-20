import type { FastifyPluginAsync, FastifyReply } from 'fastify';
import { SecurityErrorPresenter } from '../presenters';
import type { DependancesRoutesSecurity } from './DependancesRoutesSecurity';

// Ce fichier enregistre les routes HTTP de gestion du titulariat SECURITY.
export const creerTitulariatRoutes = (dependances: DependancesRoutesSecurity): FastifyPluginAsync => async (serveur) => {
  const executer = async (reponse: FastifyReply, operation: () => Promise<{ donnee: unknown }>, statutSucces = 200) => {
    try {
      const resultat = await operation();
      return reponse.code(statutSucces).send(resultat.donnee);
    } catch (erreur) {
      const presentee = SecurityErrorPresenter.presenterErreur(erreur);
      return reponse.code(presentee.statutHttp).send(presentee.corps);
    }
  };

  serveur.post('/security/titulariats', (requete, reponse) =>
    executer(reponse, () => dependances.titulariatController.attribuer(requete.body), 201));
  serveur.delete('/security/titulariats/classe/:idClasse/annee/:idAnneeScolaire', (requete, reponse) =>
    executer(reponse, () => dependances.titulariatController.retirer(
      (requete.params as Record<string, string>).idClasse,
      (requete.params as Record<string, string>).idAnneeScolaire,
    )));
  serveur.get('/security/titulariats/classe/:idClasse/annee/:idAnneeScolaire', (requete, reponse) =>
    executer(reponse, () => dependances.titulariatController.verifier(
      (requete.params as Record<string, string>).idClasse,
      (requete.params as Record<string, string>).idAnneeScolaire,
    )));
};
