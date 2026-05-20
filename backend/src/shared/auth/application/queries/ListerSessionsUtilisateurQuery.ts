import { SessionUtilisateurReadModel } from '../read-models';

// Cette query retourne les sessions connues pour un utilisateur.
export interface ListerSessionsUtilisateurQuery {
  executer(idUtilisateur: string): Promise<readonly SessionUtilisateurReadModel[]>;
}
