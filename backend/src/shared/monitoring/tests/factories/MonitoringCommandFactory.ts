import type {
  CalculateCapacityCommand,
  CalculateSaturationCommand,
  CaptureTraceCommand,
  CreateAlertCommand,
  GenerateDiagnosticCommand,
  OpenIncidentCommand,
  RegisterSignalCommand,
} from '../../../monitoring';
import {
  FIXTURE_ALERT_COMMAND,
  FIXTURE_INCIDENT_COMMAND,
  FIXTURE_MONITORING_CONTEXT,
  FIXTURE_TRACE_COMMAND,
} from '../fixtures/MonitoringFixtures';

// Ce fichier declare les fabriques de commandes des tests Monitoring.

export class MonitoringCommandFactory {
  public static creerAlerte(): CreateAlertCommand {
    return { ...FIXTURE_ALERT_COMMAND };
  }

  public static ouvrirIncident(): OpenIncidentCommand {
    return { ...FIXTURE_INCIDENT_COMMAND };
  }

  public static genererDiagnostic(): GenerateDiagnosticCommand {
    return {
      incidentId: FIXTURE_INCIDENT_COMMAND.incidentId,
      traceIds: [FIXTURE_TRACE_COMMAND.traceId],
    };
  }

  public static capturerTrace(): CaptureTraceCommand {
    return { ...FIXTURE_TRACE_COMMAND };
  }

  public static enregistrerSignal(): RegisterSignalCommand {
    return {
      type: 'health-signal',
      source: 'RUNTIME',
      nom: 'runtime_latency',
      valeur: 22,
      unite: 'ms',
      contexte: { ...FIXTURE_MONITORING_CONTEXT },
      correlationId: FIXTURE_MONITORING_CONTEXT.correlationId,
    };
  }

  public static calculerCapacite(): CalculateCapacityCommand {
    return {
      ressource: 'worker-cpu',
      utilisationActuelle: 92,
      capaciteMax: 100,
      contexte: { ...FIXTURE_MONITORING_CONTEXT },
    };
  }

  public static calculerSaturation(): CalculateSaturationCommand {
    return {
      ressource: 'queue-monitoring',
      taux: 96,
      contexte: { ...FIXTURE_MONITORING_CONTEXT },
    };
  }
}
