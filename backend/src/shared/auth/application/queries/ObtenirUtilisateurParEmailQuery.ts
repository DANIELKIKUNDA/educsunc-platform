import { UtilisateurAuthReadModel } from '../read-models';

// Cette query charge un utilisateur a partir de son email pour les lectures optimisees.
export interface ObtenirUtilisateurParEmailQuery {
  executer(email: string): Promise<UtilisateurAuthReadModel | null>;
}
