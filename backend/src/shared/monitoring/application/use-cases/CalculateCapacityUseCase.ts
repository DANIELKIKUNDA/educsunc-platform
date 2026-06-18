import type { CalculateCapacityCommand } from '../commands';
import type { CapacityDto } from '../dto/output';
import { ApplicationObservabilityService } from '../services';

// Ce fichier declare le use case de calcul de capacite.

/** Cette classe orchestre le calcul applicatif de capacite. */
export class CalculateCapacityUseCase {
  constructor(private readonly service: ApplicationObservabilityService) {}

  /** Cette methode execute le calcul applicatif. */
  public async executer(commande: CalculateCapacityCommand): Promise<CapacityDto> {
    return this.service.enregistrerCapacite(commande);
  }
}
