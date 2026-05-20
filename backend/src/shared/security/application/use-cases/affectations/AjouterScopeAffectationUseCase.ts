import type { UseCase } from 'shared/application/UseCase';
import type { AjouterScopeAffectationInput } from '../../dto/input';
import type { ScopeUtilisateurOutput } from '../../dto/output';
import { SagaAffectationUtilisateur } from '../../sagas';

export class AjouterScopeAffectationUseCase implements UseCase<AjouterScopeAffectationInput, readonly ScopeUtilisateurOutput[]> {
  constructor(private readonly sagaAffectationUtilisateur: SagaAffectationUtilisateur) {}
  public async executer(entree: AjouterScopeAffectationInput): Promise<readonly ScopeUtilisateurOutput[]> {
    return this.sagaAffectationUtilisateur.ajouterScope(entree);
  }
}
