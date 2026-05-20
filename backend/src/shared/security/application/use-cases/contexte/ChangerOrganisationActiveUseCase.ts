import type { UseCase } from 'shared/application/UseCase';
import type { ChangerOrganisationActiveInput } from '../../dto/input';
import type { ContexteActifOutput } from '../../dto/output';
import { SagaContexteActif } from '../../sagas';

export class ChangerOrganisationActiveUseCase implements UseCase<ChangerOrganisationActiveInput, ContexteActifOutput> {
  constructor(private readonly sagaContexteActif: SagaContexteActif) {}
  public async executer(entree: ChangerOrganisationActiveInput): Promise<ContexteActifOutput> {
    return this.sagaContexteActif.changerOrganisationActive(entree);
  }
}
