import type { CalculateSaturationCommand } from '../../application';
import { CalculateSaturationUseCase } from '../../application';

// Ce fichier declare le runtime de saturation Monitoring.

export class RuntimeSaturationMonitoring {
  constructor(private readonly useCase: CalculateSaturationUseCase) {}

  public async calculer(commande: CalculateSaturationCommand) {
    return this.useCase.executer(commande);
  }
}
