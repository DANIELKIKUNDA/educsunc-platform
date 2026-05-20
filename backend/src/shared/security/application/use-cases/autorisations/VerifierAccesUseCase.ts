import type { UseCase } from 'shared/application/UseCase';
import type { VerifierAccesInput } from '../../dto/input';
import type { DecisionAutorisationOutput } from '../../dto/output';
import { SagaAutorisation } from '../../sagas';

export class VerifierAccesUseCase implements UseCase<VerifierAccesInput, DecisionAutorisationOutput> {
  constructor(private readonly sagaAutorisation: SagaAutorisation) {}
  public async executer(entree: VerifierAccesInput): Promise<DecisionAutorisationOutput> {
    return this.sagaAutorisation.verifierAcces(entree);
  }
}
