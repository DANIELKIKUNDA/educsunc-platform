import type { UseCase } from 'shared/application/UseCase';
import type { ChangerEcoleActiveInput } from '../../dto/input';
import type { ContexteActifOutput } from '../../dto/output';
import { SagaContexteActif } from '../../sagas';

export class ChangerEcoleActiveUseCase implements UseCase<ChangerEcoleActiveInput, ContexteActifOutput> {
  constructor(private readonly sagaContexteActif: SagaContexteActif) {}
  public async executer(entree: ChangerEcoleActiveInput): Promise<ContexteActifOutput> {
    return this.sagaContexteActif.changerEcoleActive(entree);
  }
}
