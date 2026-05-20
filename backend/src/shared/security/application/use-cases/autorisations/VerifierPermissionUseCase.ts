import type { UseCase } from 'shared/application/UseCase';
import type { VerifierPermissionInput } from '../../dto/input';
import type { VerificationPermissionOutput } from '../../dto/output';
import { SagaAutorisation } from '../../sagas';

export class VerifierPermissionUseCase implements UseCase<VerifierPermissionInput, VerificationPermissionOutput> {
  constructor(private readonly sagaAutorisation: SagaAutorisation) {}
  public async executer(entree: VerifierPermissionInput): Promise<VerificationPermissionOutput> {
    return this.sagaAutorisation.verifierPermission(entree);
  }
}
