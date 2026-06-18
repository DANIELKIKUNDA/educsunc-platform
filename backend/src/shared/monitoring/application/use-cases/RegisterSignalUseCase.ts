import type { RegisterSignalCommand } from '../commands';
import { ApplicationObservabilityService } from '../services';

// Ce fichier declare le use case d enregistrement d un signal.

/** Cette classe orchestre l enregistrement applicatif d un signal. */
export class RegisterSignalUseCase {
  constructor(private readonly service: ApplicationObservabilityService) {}

  /** Cette methode execute l enregistrement du signal. */
  public async executer(commande: RegisterSignalCommand): Promise<void> {
    await this.service.enregistrerSignal(commande);
  }
}
