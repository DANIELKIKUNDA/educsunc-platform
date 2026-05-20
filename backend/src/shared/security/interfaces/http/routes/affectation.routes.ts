import type { FastifyPluginAsync, FastifyReply } from 'fastify';
import { SecurityErrorPresenter } from '../presenters';
import type { DependancesRoutesSecurity } from './DependancesRoutesSecurity';

// Ce fichier enregistre les routes HTTP de gestion des affectations SECURITY.
export const creerAffectationRoutes = (dependances: DependancesRoutesSecurity): FastifyPluginAsync => async (serveur) => {
  const executer = async (reponse: FastifyReply, operation: () => Promise<{ donnee: unknown }>, statutSucces = 200) => {
    try {
      const resultat = await operation();
      return reponse.code(statutSucces).send(resultat.donnee);
    } catch (erreur) {
      const presentee = SecurityErrorPresenter.presenterErreur(erreur);
      return reponse.code(presentee.statutHttp).send(presentee.corps);
    }
  };

  serveur.post('/security/affectations', (requete, reponse) =>
    executer(reponse, () => dependances.affectationUtilisateurController.creer(requete.body), 201));
  serveur.patch('/security/affectations/:idAffectationUtilisateur/activate', (requete, reponse) =>
    executer(reponse, () => dependances.affectationUtilisateurController.activer((requete.params as Record<string, string>).idAffectationUtilisateur)));
  serveur.patch('/security/affectations/:idAffectationUtilisateur/deactivate', (requete, reponse) =>
    executer(reponse, () => dependances.affectationUtilisateurController.desactiver((requete.params as Record<string, string>).idAffectationUtilisateur)));
  serveur.post('/security/affectations/:idAffectationUtilisateur/scopes', (requete, reponse) =>
    executer(reponse, () => dependances.affectationUtilisateurController.ajouterScope((requete.params as Record<string, string>).idAffectationUtilisateur, requete.body), 201));
  serveur.delete('/security/affectations/:idAffectationUtilisateur/scopes/:typeScope/:valeurScope', (requete, reponse) =>
    executer(reponse, () => dependances.affectationUtilisateurController.retirerScope(
      (requete.params as Record<string, string>).idAffectationUtilisateur,
      (requete.params as Record<string, string>).typeScope,
      (requete.params as Record<string, string>).valeurScope,
    )));
  serveur.get('/security/affectations/utilisateur/:idUtilisateur', (requete, reponse) =>
    executer(reponse, () => dependances.affectationUtilisateurController.listerAffectations((requete.params as Record<string, string>).idUtilisateur)));
  serveur.get('/security/affectations/utilisateur/:idUtilisateur/scopes', (requete, reponse) =>
    executer(reponse, () => dependances.affectationUtilisateurController.listerScopes((requete.params as Record<string, string>).idUtilisateur)));
};
