import { HistoriqueConnexionReadModel } from '../read-models';

// Cette query retourne l'historique recent des connexions d'un utilisateur.
export interface ListerTentativesConnexionQuery {
  executer(idUtilisateur: string): Promise<readonly HistoriqueConnexionReadModel[]>;
}
