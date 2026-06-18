import type { RegisterSignalCommand } from '../../application';
import { RegisterSignalUseCase } from '../../application';

// Ce fichier declare le runtime de signaux Monitoring.

export class RuntimeSignalsMonitoring {
  constructor(private readonly useCase: RegisterSignalUseCase) {}

  public async publier(commande: RegisterSignalCommand): Promise<void> {
    await this.useCase.executer(commande);
  }
}
