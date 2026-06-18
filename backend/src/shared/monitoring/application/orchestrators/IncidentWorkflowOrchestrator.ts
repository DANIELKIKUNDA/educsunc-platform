import type {
  EscalateIncidentCommand,
  GenerateDiagnosticCommand,
  OpenIncidentCommand,
} from '../commands';
import type { DiagnosticDto, IncidentDto } from '../dto/output';
import {
  EscalateIncidentUseCase,
  GenerateDiagnosticUseCase,
  OpenIncidentUseCase,
} from '../use-cases';

// Ce fichier declare l orchestrateur de workflow incident.

/** Cette classe orchestre le cycle de vie applicatif d un incident. */
export class IncidentWorkflowOrchestrator {
  constructor(
    private readonly openIncidentUseCase: OpenIncidentUseCase,
    private readonly generateDiagnosticUseCase: GenerateDiagnosticUseCase,
    private readonly escalateIncidentUseCase: EscalateIncidentUseCase,
  ) {}

  /** Cette methode ouvre, diagnostique et escalade un incident si necessaire. */
  public async executer(
    ouverture: OpenIncidentCommand,
    diagnostic: GenerateDiagnosticCommand,
    escalation?: EscalateIncidentCommand,
  ): Promise<{ readonly incident: IncidentDto; readonly diagnostic: DiagnosticDto; readonly incidentEscalade?: IncidentDto }> {
    const incident = await this.openIncidentUseCase.executer(ouverture);
    const diagnosticGenere = await this.generateDiagnosticUseCase.executer(diagnostic);
    const incidentEscalade = escalation
      ? await this.escalateIncidentUseCase.executer(escalation)
      : undefined;

    return {
      incident,
      diagnostic: diagnosticGenere,
      incidentEscalade,
    };
  }
}
