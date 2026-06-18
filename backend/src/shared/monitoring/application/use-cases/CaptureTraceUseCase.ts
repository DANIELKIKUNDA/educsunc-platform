import type { CaptureTraceCommand } from '../commands';
import type { TraceDto } from '../dto/output';
import { ApplicationObservabilityService } from '../services';

// Ce fichier declare le use case de capture de trace.

/** Cette classe orchestre la capture applicative d une trace. */
export class CaptureTraceUseCase {
  constructor(private readonly service: ApplicationObservabilityService) {}

  /** Cette methode execute la capture applicative. */
  public async executer(commande: CaptureTraceCommand): Promise<TraceDto> {
    return this.service.capturerTrace(commande);
  }
}
