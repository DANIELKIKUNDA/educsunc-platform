import type { CalculateCapacityCommand } from '../../application';
import { CalculateCapacityUseCase } from '../../application';

// Ce fichier declare le runtime de capacite Monitoring.

export class RuntimeCapacityMonitoring {
  constructor(private readonly useCase: CalculateCapacityUseCase) {}

  public async calculer(commande: CalculateCapacityCommand) {
    return this.useCase.executer(commande);
  }
}
