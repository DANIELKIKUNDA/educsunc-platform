import {
  CapaciteSysteme,
  MetriqueTechnique,
  SignalSysteme,
  Saturation,
  TraceOperation,
  ValeurMetrique,
} from '../../domain';
import type {
  CalculateCapacityCommand,
  CalculateSaturationCommand,
  CaptureTraceCommand,
  RegisterSignalCommand,
} from '../commands';
import type { CapacityDto, SaturationDto, TraceDto } from '../dto/output';
import { MonitoringContextMapper, TraceMapper } from '../mappers';
import type { MonitoringMetricsPort, MonitoringObservabilityPort, MonitoringTracingPort } from '../ports';
import { ValidateMonitoringContext, ValidateTraceCapture } from '../validators';

// Ce fichier declare le service applicatif d observabilite.

/** Cette classe centralise les signaux, traces et mesures techniques. */
export class ApplicationObservabilityService {
  constructor(
    private readonly observabilityPort: MonitoringObservabilityPort,
    private readonly metricsPort: MonitoringMetricsPort,
    private readonly tracingPort: MonitoringTracingPort,
    private readonly validateurContexte = new ValidateMonitoringContext(),
    private readonly validateurTrace = new ValidateTraceCapture(),
    private readonly mapper = new MonitoringContextMapper(),
    private readonly sortieTrace = new TraceMapper(),
  ) {}

  /** Cette methode enregistre un signal d observabilite. */
  public async enregistrerSignal(commande: RegisterSignalCommand): Promise<void> {
    this.validateurContexte.valider(commande.contexte);
    const signal = new SignalSysteme({
      type: commande.type,
      source: commande.source,
      nom: commande.nom,
      valeur: commande.valeur,
      unite: commande.unite,
      contexte: this.mapper.versContexte(commande.contexte).valeur(),
      correlation: this.mapper.versCorrelation(commande.correlationId).valeur(),
      recuLe: new Date(),
    });
    await this.observabilityPort.publierSignal(signal);
    await this.metricsPort.enregistrerMetriqueTechnique(
      new MetriqueTechnique({
        nom: commande.nom,
        source: commande.source,
        valeur: new ValeurMetrique({
          valeur: commande.valeur,
          unite: commande.unite,
          horodatage: new Date(),
        }).valeur(),
        contexte: this.mapper.versContexte(commande.contexte).valeur(),
      }),
    );
  }

  /** Cette methode capture une trace. */
  public async capturerTrace(commande: CaptureTraceCommand): Promise<TraceDto> {
    this.validateurContexte.valider(commande.contexte);
    this.validateurTrace.valider(commande);
    const trace = new TraceOperation({
      identifiant: commande.traceId,
      type: commande.type,
      operation: commande.operation,
      succes: commande.succes,
      dureeMillisecondes: commande.dureeMillisecondes,
      message: commande.message,
      contexte: this.mapper.versContexte(commande.contexte).valeur(),
      correlation: this.mapper.versCorrelation(commande.correlationId).valeur(),
      captureeLe: new Date(),
    });
    await this.tracingPort.enregistrerTrace(trace);
    return this.sortieTrace.versDto(trace);
  }

  /** Cette methode enregistre une capacite calculee. */
  public async enregistrerCapacite(commande: CalculateCapacityCommand): Promise<CapacityDto> {
    this.validateurContexte.valider(commande.contexte);
    const capacite = new CapaciteSysteme({
      ressource: commande.ressource,
      utilisationActuelle: commande.utilisationActuelle,
      capaciteMax: commande.capaciteMax,
      margeDisponible: Math.max(0, commande.capaciteMax - commande.utilisationActuelle),
      niveau: commande.utilisationActuelle >= commande.capaciteMax * 0.9 ? 'CRITICAL' : 'DEGRADED',
      estimeeLe: new Date(),
    });
    await this.metricsPort.enregistrerCapacite(capacite);
    return capacite.valeur();
  }

  /** Cette methode enregistre une saturation calculee. */
  public async enregistrerSaturation(commande: CalculateSaturationCommand): Promise<SaturationDto> {
    this.validateurContexte.valider(commande.contexte);
    const saturation = new Saturation({
      ressource: commande.ressource,
      taux: commande.taux,
      niveau: commande.taux >= 90 ? 'CRITICAL' : commande.taux >= 70 ? 'DEGRADED' : 'HEALTHY',
      goulot: commande.taux >= 95,
      observeeLe: new Date(),
    });
    await this.metricsPort.enregistrerSaturation(saturation);
    return saturation.valeur();
  }
}
