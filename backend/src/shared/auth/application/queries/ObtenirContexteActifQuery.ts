import { ContexteActifReadModel } from '../read-models';

// Cette query charge le contexte actif d'un utilisateur.
export interface ObtenirContexteActifQuery {
  executer(idUtilisateur: string): Promise<ContexteActifReadModel | null>;
}
