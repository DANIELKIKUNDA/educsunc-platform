import type { UseCase } from 'shared/application/UseCase';
import type { ActiverAffectationInput } from '../../dto/input';
import type { AffectationUtilisateurOutput } from '../../dto/output';
import { SecurityAffectationService } from '../../services/SecurityAffectationService';

export class ActiverAffectationUseCase implements UseCase<ActiverAffectationInput, AffectationUtilisateurOutput> {
  constructor(private readonly securityAffectationService: SecurityAffectationService) {}
  public async executer(entree: ActiverAffectationInput): Promise<AffectationUtilisateurOutput> {
    return this.securityAffectationService.activerAffectation(entree);
  }
}
