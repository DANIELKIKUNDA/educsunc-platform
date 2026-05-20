import type { UseCase } from 'shared/application/UseCase';
import type { VerifierScopeInput } from '../../dto/input';
import type { VerificationScopeOutput } from '../../dto/output';
import { SagaAutorisation } from '../../sagas';

export class VerifierScopeUseCase implements UseCase<VerifierScopeInput, VerificationScopeOutput> {
  constructor(private readonly sagaAutorisation: SagaAutorisation) {}
  public async executer(entree: VerifierScopeInput): Promise<VerificationScopeOutput> {
    return this.sagaAutorisation.verifierScope(entree);
  }
}
