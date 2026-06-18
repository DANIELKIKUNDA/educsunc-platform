import type { GenerateDiagnosticCommand } from '../../application';
import { GenerateDiagnosticUseCase } from '../../application';

// Ce fichier declare le runtime de diagnostics incidents.

export class RuntimeIncidentDiagnosticsMonitoring {
  constructor(private readonly useCase: GenerateDiagnosticUseCase) {}

  public async generer(commande: GenerateDiagnosticCommand) {
    return this.useCase.executer(commande);
  }
}
