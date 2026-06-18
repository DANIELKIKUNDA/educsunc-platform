import { IncidentSysteme, MonitoringId, ServiceDiagnosticIncident } from '../../domain';
import type { EscalateIncidentCommand, GenerateDiagnosticCommand, OpenIncidentCommand } from '../commands';
import type { DiagnosticDto, IncidentDto } from '../dto/output';
import { MonitoringNotFoundException } from '../exceptions';
import { DiagnosticMapper, IncidentMapper, MonitoringContextMapper } from '../mappers';
import type { MonitoringIncidentPort, MonitoringTracingPort } from '../ports';
import { ValidateIncidentLifecycle, ValidateMonitoringContext } from '../validators';

// Ce fichier declare le service applicatif d incidents.

/** Cette classe centralise la gestion applicative des incidents. */
export class ApplicationIncidentMonitoringService {
  constructor(
    private readonly incidentPort: MonitoringIncidentPort,
    private readonly tracingPort: MonitoringTracingPort,
    private readonly validateurContexte = new ValidateMonitoringContext(),
    private readonly validateurIncident = new ValidateIncidentLifecycle(),
    private readonly mapper = new MonitoringContextMapper(),
    private readonly diagnosticService = new ServiceDiagnosticIncident(),
    private readonly sortieIncident = new IncidentMapper(),
    private readonly sortieDiagnostic = new DiagnosticMapper(),
  ) {}

  /** Cette methode ouvre un incident. */
  public async ouvrir(commande: OpenIncidentCommand): Promise<IncidentDto> {
    this.validateurContexte.valider(commande.contexte);
    const incident = new IncidentSysteme(
      MonitoringId.creer(commande.incidentId),
      commande.resume,
      commande.niveau,
      this.mapper.versContexte(commande.contexte),
      this.mapper.versCorrelation(commande.correlationId),
    );
    await this.incidentPort.enregistrerIncident(incident);
    return this.sortieIncident.versDto(incident);
  }

  /** Cette methode escalade un incident. */
  public async escalader(commande: EscalateIncidentCommand): Promise<IncidentDto> {
    this.validateurIncident.validerIncidentId(commande.incidentId);
    const incident = await this.incidentPort.retrouverIncident(commande.incidentId);
    if (!incident) {
      throw new MonitoringNotFoundException('Cet incident est introuvable.');
    }
    incident.escalader();
    await this.incidentPort.enregistrerIncident(incident);
    return this.sortieIncident.versDto(incident);
  }

  /** Cette methode genere un diagnostic. */
  public async genererDiagnostic(commande: GenerateDiagnosticCommand): Promise<DiagnosticDto> {
    this.validateurIncident.validerIncidentId(commande.incidentId);
    const incident = await this.incidentPort.retrouverIncident(commande.incidentId);
    if (!incident) {
      throw new MonitoringNotFoundException('Cet incident est introuvable.');
    }

    const traces = await this.tracingPort.retrouverTraces(commande.traceIds);
    const diagnostic = this.diagnosticService.generer(incident, traces);
    incident.ajouterDiagnostic(diagnostic);
    await this.incidentPort.enregistrerDiagnostic(diagnostic);
    await this.incidentPort.enregistrerIncident(incident);

    return this.sortieDiagnostic.versDto(diagnostic);
  }
}
