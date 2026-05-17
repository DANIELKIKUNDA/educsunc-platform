import type { SynchroniserOperationOfflineInput } from '../dto/input/SynchroniserOperationOfflineInput';
import type { SynchronisationOutput } from '../dto/output/SynchronisationOutput';
import type { SynchroniserOperationsOfflineUseCase } from '../use-cases/SynchroniserOperationsOffline/SynchroniserOperationsOfflineUseCase';

// Cette saga orchestre le rejeu complet d'une operation offline.
export class SagaSynchronisationOffline {
  constructor(private readonly useCase: SynchroniserOperationsOfflineUseCase) {}

  // Cette methode rejoue l'operation offline demandee.
  public async executer(input: SynchroniserOperationOfflineInput): Promise<SynchronisationOutput> {
    return this.useCase.executer(input);
  }
}
