import type { CalculateSaturationCommand } from '../commands';
import type { SaturationDto } from '../dto/output';
import { ApplicationObservabilityService } from '../services';

// Ce fichier declare le use case de calcul de saturation.

/** Cette classe orchestre le calcul applicatif de saturation. */
export class CalculateSaturationUseCase {
  constructor(private readonly service: ApplicationObservabilityService) {}

  /** Cette methode execute le calcul applicatif. */
  public async executer(commande: CalculateSaturationCommand): Promise<SaturationDto> {
    return this.service.enregistrerSaturation(commande);
  }
}
