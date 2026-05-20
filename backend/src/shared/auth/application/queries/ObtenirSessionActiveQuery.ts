import { SessionUtilisateurReadModel } from '../read-models';

// Cette query charge la session active d'un utilisateur ou d'un identifiant de session.
export interface ObtenirSessionActiveQuery {
  executer(idSessionUtilisateur: string): Promise<SessionUtilisateurReadModel | null>;
}
