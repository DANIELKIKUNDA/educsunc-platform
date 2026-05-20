import type { ContexteActifReadModel } from '../read-models';
export interface ObtenirContexteActifQuery {
  executer(idUtilisateur: string): Promise<ContexteActifReadModel | null>;
}
