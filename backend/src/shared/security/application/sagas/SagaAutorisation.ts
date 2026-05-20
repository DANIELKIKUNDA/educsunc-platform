import type { DecisionAutorisationOutput, VerificationPermissionOutput, VerificationScopeOutput } from '../dto/output';
import type { VerifierAccesInput, VerifierPermissionInput, VerifierScopeInput } from '../dto/input';
import { SecurityFacade } from '../services/SecurityFacade';

// Cette saga regroupe les parcours de verification d'autorisation.
export class SagaAutorisation {
  constructor(private readonly securityFacade: SecurityFacade) {}

  public async verifierPermission(input: VerifierPermissionInput): Promise<VerificationPermissionOutput> {
    return this.securityFacade.verifierPermission(input);
  }

  public async verifierScope(input: VerifierScopeInput): Promise<VerificationScopeOutput> {
    return this.securityFacade.verifierScope(input);
  }

  public async verifierAcces(input: VerifierAccesInput): Promise<DecisionAutorisationOutput> {
    return this.securityFacade.verifierAcces(input);
  }
}
