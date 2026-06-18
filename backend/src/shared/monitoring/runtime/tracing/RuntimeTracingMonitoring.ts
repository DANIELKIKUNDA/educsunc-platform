import type { CaptureTraceCommand } from '../../application';
import { CaptureTraceUseCase } from '../../application';

// Ce fichier declare le runtime de tracing Monitoring.

export class RuntimeTracingMonitoring {
  constructor(private readonly useCase: CaptureTraceUseCase) {}

  public async capturer(commande: CaptureTraceCommand) {
    return this.useCase.executer(commande);
  }
}
