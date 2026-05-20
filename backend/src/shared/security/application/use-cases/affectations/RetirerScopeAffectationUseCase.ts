import type { UseCase } from 'shared/application/UseCase';
import type { RetirerScopeAffectationInput } from '../../dto/input';
import type { ScopeUtilisateurOutput } from '../../dto/output';
import { SecurityAffectationService } from '../../services/SecurityAffectationService';

export class RetirerScopeAffectationUseCase implements UseCase<RetirerScopeAffectationInput, readonly ScopeUtilisateurOutput[]> {
  constructor(private readonly securityAffectationService: SecurityAffectationService) {}
  public async executer(entree: RetirerScopeAffectationInput): Promise<readonly ScopeUtilisateurOutput[]> {
    return this.securityAffectationService.retirerScope(entree);
  }
}
