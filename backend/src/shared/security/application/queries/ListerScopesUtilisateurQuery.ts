import type { ScopeUtilisateurReadModel } from '../read-models';
export interface ListerScopesUtilisateurQuery {
  executer(idUtilisateur: string): Promise<readonly ScopeUtilisateurReadModel[]>;
}
