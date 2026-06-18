import type { GenerateDiagnosticCommand } from '../commands';
import type { DiagnosticDto } from '../dto/output';
import { ApplicationIncidentMonitoringService } from '../services';

// Ce fichier declare le use case de generation de diagnostic.

/** Cette classe orchestre la generation applicative de diagnostic. */
export class GenerateDiagnosticUseCase {
  constructor(private readonly service: ApplicationIncidentMonitoringService) {}

  /** Cette methode execute la generation applicative. */
  public async executer(commande: GenerateDiagnosticCommand): Promise<DiagnosticDto> {
    return this.service.genererDiagnostic(commande);
  }
}
