import {
  Alerte,
  ContexteMonitoring,
  CorrelationMonitoring,
  DiagnosticIncident,
  EtatComposant,
  EtatDependance,
  EtatRuntime,
  EtatSysteme,
  IncidentSysteme,
  MonitoringId,
  TraceOperation,
} from '../../../monitoring';
import {
  FIXTURE_ALERT_COMMAND,
  FIXTURE_INCIDENT_COMMAND,
  FIXTURE_MONITORING_CONTEXT,
  FIXTURE_TRACE_COMMAND,
} from '../fixtures/MonitoringFixtures';

// Ce fichier declare les fabriques de domaine des tests Monitoring.

export class MonitoringFactory {
  public static creerContexte(overrides: Partial<typeof FIXTURE_MONITORING_CONTEXT> = {}): ContexteMonitoring {
    return ContexteMonitoring.creer({
      ...FIXTURE_MONITORING_CONTEXT,
      ...overrides,
    });
  }

  public static creerCorrelation(correlationId = FIXTURE_MONITORING_CONTEXT.correlationId): CorrelationMonitoring {
    return new CorrelationMonitoring({ correlationId });
  }

  public static creerAlerte(overrides: Partial<ReturnType<Alerte['valeur']>> = {}): Alerte {
    return new Alerte({
      identifiant: FIXTURE_ALERT_COMMAND.alertId,
      indicateur: FIXTURE_ALERT_COMMAND.indicateur,
      gravite: 'CRITICAL',
      statut: 'OPEN',
      message: FIXTURE_ALERT_COMMAND.message,
      seuil: {
        indicateur: FIXTURE_ALERT_COMMAND.indicateur,
        warning: FIXTURE_ALERT_COMMAND.warning,
        critical: FIXTURE_ALERT_COMMAND.critical,
        unite: FIXTURE_ALERT_COMMAND.unite,
        graviteParDefaut: 'WARNING',
      },
      valeurObservee: FIXTURE_ALERT_COMMAND.valeurObservee,
      contexte: { ...FIXTURE_MONITORING_CONTEXT },
      correlation: { correlationId: FIXTURE_MONITORING_CONTEXT.correlationId },
      declencheeLe: new Date(),
      ...overrides,
    });
  }

  public static creerIncident(): IncidentSysteme {
    return new IncidentSysteme(
      MonitoringId.creer(FIXTURE_INCIDENT_COMMAND.incidentId),
      FIXTURE_INCIDENT_COMMAND.resume,
      FIXTURE_INCIDENT_COMMAND.niveau,
      this.creerContexte(),
      this.creerCorrelation(),
    );
  }

  public static creerDiagnostic(): DiagnosticIncident {
    return new DiagnosticIncident({
      incidentId: FIXTURE_INCIDENT_COMMAND.incidentId,
      resume: 'Diagnostic generated',
      causesProbables: ['latence', 'queue'],
      recommandations: ['verifier runtime'],
      niveau: 'CRITICAL',
      contexte: { ...FIXTURE_MONITORING_CONTEXT },
      correlation: { correlationId: FIXTURE_MONITORING_CONTEXT.correlationId },
      genereLe: new Date(),
    });
  }

  public static creerTrace(overrides: Partial<ReturnType<TraceOperation['valeur']>> = {}): TraceOperation {
    return new TraceOperation({
      identifiant: FIXTURE_TRACE_COMMAND.traceId,
      type: FIXTURE_TRACE_COMMAND.type,
      operation: FIXTURE_TRACE_COMMAND.operation,
      succes: FIXTURE_TRACE_COMMAND.succes,
      dureeMillisecondes: FIXTURE_TRACE_COMMAND.dureeMillisecondes,
      message: FIXTURE_TRACE_COMMAND.message,
      contexte: { ...FIXTURE_MONITORING_CONTEXT },
      correlation: { correlationId: FIXTURE_MONITORING_CONTEXT.correlationId },
      captureeLe: new Date(),
      ...overrides,
    });
  }

  public static creerEtatSystemeCritique(): EtatSysteme {
    return new EtatSysteme(
      this.creerContexte(),
      [
        new EtatComposant({
          nom: 'api',
          niveau: 'CRITICAL',
          message: 'API down',
          dernierControleLe: new Date(),
          contexte: { ...FIXTURE_MONITORING_CONTEXT },
        }),
      ],
      [
        new EtatDependance({
          nom: 'database',
          source: 'DATABASE',
          niveau: 'HEALTHY',
          disponible: true,
          message: 'ok',
          verifieLe: new Date(),
        }),
      ],
      new EtatRuntime({
        niveau: 'HEALTHY',
        filesActives: ['monitoring'],
        workersActifs: ['health'],
        jobsEnCours: 0,
        jobsEnRetard: 0,
        misAJourLe: new Date(),
      }),
    );
  }
}
