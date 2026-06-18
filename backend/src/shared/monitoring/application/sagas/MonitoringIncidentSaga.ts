import type { EscalateIncidentCommand, GenerateDiagnosticCommand, OpenIncidentCommand } from '../commands';
import { EscalateIncidentUseCase, GenerateDiagnosticUseCase, OpenIncidentUseCase } from '../use-cases';

// Ce fichier declare la saga d incidents Monitoring.

/** Cette classe orchestre un cycle court incident -> diagnostic -> escalation. */
export class MonitoringIncidentSaga {
  constructor(
    private readonly openIncidentUseCase: OpenIncidentUseCase,
    private readonly generateDiagnosticUseCase: GenerateDiagnosticUseCase,
    private readonly escalateIncidentUseCase: EscalateIncidentUseCase,
  ) {}

  /** Cette methode execute la saga de gestion d incident. */
  public async executer(
    ouverture: OpenIncidentCommand,
    diagnostic: GenerateDiagnosticCommand,
    escalation: EscalateIncidentCommand,
  ): Promise<void> {
    await this.openIncidentUseCase.executer(ouverture);
    await this.generateDiagnosticUseCase.executer(diagnostic);
    await this.escalateIncidentUseCase.executer(escalation);
  }
}
