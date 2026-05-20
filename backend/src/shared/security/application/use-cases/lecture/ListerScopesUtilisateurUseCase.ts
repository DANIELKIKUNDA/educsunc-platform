import type { UseCase } from 'shared/application/UseCase';
import type { ScopeUtilisateurReadModel } from '../../read-models';
import type { ListerScopesUtilisateurQuery } from '../../queries';

export class ListerScopesUtilisateurUseCase implements UseCase<{ idUtilisateur: string }, readonly ScopeUtilisateurReadModel[]> {
  constructor(private readonly listerScopesUtilisateurQuery: ListerScopesUtilisateurQuery) {}
  public async executer(entree: { idUtilisateur: string }): Promise<readonly ScopeUtilisateurReadModel[]> {
    return this.listerScopesUtilisateurQuery.executer(entree.idUtilisateur);
  }
}
