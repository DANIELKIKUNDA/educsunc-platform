import type { UseCase } from 'shared/application/UseCase';
import type { VerifierRestrictionInput } from '../../dto/input';
import { SecurityFacade } from '../../services/SecurityFacade';

export class VerifierRestrictionUseCase implements UseCase<VerifierRestrictionInput, boolean> {
  constructor(private readonly securityFacade: SecurityFacade) {}
  public async executer(entree: VerifierRestrictionInput): Promise<boolean> {
    return this.securityFacade.verifierRestriction(entree);
  }
}
