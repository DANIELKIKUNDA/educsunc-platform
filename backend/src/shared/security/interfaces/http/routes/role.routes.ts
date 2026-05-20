import type { FastifyPluginAsync, FastifyReply } from 'fastify';
import { SecurityErrorPresenter } from '../presenters';
import type { DependancesRoutesSecurity } from './DependancesRoutesSecurity';

// Ce fichier enregistre les routes HTTP de gestion des roles SECURITY.
export const creerRoleRoutes = (dependances: DependancesRoutesSecurity): FastifyPluginAsync => async (serveur) => {
  const executer = async (reponse: FastifyReply, operation: () => Promise<{ donnee: unknown }>, statutSucces = 200) => {
    try {
      const resultat = await operation();
      return reponse.code(statutSucces).send(resultat.donnee);
    } catch (erreur) {
      const presentee = SecurityErrorPresenter.presenterErreur(erreur);
      return reponse.code(presentee.statutHttp).send(presentee.corps);
    }
  };

  serveur.post('/security/roles', (requete, reponse) =>
    executer(reponse, () => dependances.roleController.creer(requete.body), 201));
  serveur.patch('/security/roles/:codeRole/activate', (requete, reponse) =>
    executer(reponse, () => dependances.roleController.activer((requete.params as Record<string, string>).codeRole)));
  serveur.patch('/security/roles/:codeRole/deactivate', (requete, reponse) =>
    executer(reponse, () => dependances.roleController.desactiver((requete.params as Record<string, string>).codeRole)));
  serveur.post('/security/roles/:codeRole/permissions', (requete, reponse) =>
    executer(reponse, () => dependances.roleController.ajouterPermission((requete.params as Record<string, string>).codeRole, requete.body), 201));
  serveur.delete('/security/roles/:codeRole/permissions/:permission', (requete, reponse) =>
    executer(reponse, () => dependances.roleController.retirerPermission((requete.params as Record<string, string>).codeRole, (requete.params as Record<string, string>).permission)));
  serveur.post('/security/roles/:codeRole/restrictions', (requete, reponse) =>
    executer(reponse, () => dependances.roleController.ajouterRestriction((requete.params as Record<string, string>).codeRole, requete.body), 201));
  serveur.delete('/security/roles/:codeRole/restrictions/:codeRestriction', (requete, reponse) =>
    executer(reponse, () => dependances.roleController.retirerRestriction((requete.params as Record<string, string>).codeRole, (requete.params as Record<string, string>).codeRestriction)));
  serveur.get('/security/roles', (_requete, reponse) =>
    executer(reponse, () => dependances.roleController.listerRoles()));
  serveur.get('/security/roles/:codeRole/permissions', (requete, reponse) =>
    executer(reponse, () => dependances.roleController.listerPermissions((requete.params as Record<string, string>).codeRole)));
};
