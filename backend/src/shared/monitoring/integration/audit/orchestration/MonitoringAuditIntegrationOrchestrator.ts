import type { MonitoringContext } from '../../../context';
import type { MonitoringAuditSnapshot } from '../MonitoringAuditIntegrationTypes';
import { AuditAlertsMonitoringIntegration } from '../alerts/AuditAlertsMonitoringIntegration';
import { AuditAnalyticsMonitoringIntegration } from '../analytics/AuditAnalyticsMonitoringIntegration';
import { AuditAnomaliesMonitoringIntegration } from '../anomalies/AuditAnomaliesMonitoringIntegration';
import { AuditExportsMonitoringIntegration } from '../exports/AuditExportsMonitoringIntegration';
import { AuditForensicMonitoringIntegration } from '../forensic/AuditForensicMonitoringIntegration';
import { AuditIncidentsMonitoringIntegration } from '../incidents/AuditIncidentsMonitoringIntegration';
import { AuditMetricsIntegration } from '../metrics/AuditMetricsIntegration';
import { AuditObservabilityIntegration } from '../observability/AuditObservabilityIntegration';
import { AuditProjectionsMonitoringIntegration } from '../projections/AuditProjectionsMonitoringIntegration';
import { AuditQueuesMonitoringIntegration } from '../queues/AuditQueuesMonitoringIntegration';
import { AuditReplayMonitoringIntegration } from '../replay/AuditReplayMonitoringIntegration';
import { AuditRetryMonitoringIntegration } from '../retry/AuditRetryMonitoringIntegration';
import { AuditSynchronizationMonitoringIntegration } from '../synchronization/AuditSynchronizationMonitoringIntegration';
import { AuditTracesIntegration } from '../traces/AuditTracesIntegration';
import { AuditWorkersMonitoringIntegration } from '../workers/AuditWorkersMonitoringIntegration';

export class MonitoringAuditIntegrationOrchestrator {
  public readonly metrics = new AuditMetricsIntegration();
  public readonly traces = new AuditTracesIntegration();
  public readonly queues = new AuditQueuesMonitoringIntegration();
  public readonly workers = new AuditWorkersMonitoringIntegration();
  public readonly replay = new AuditReplayMonitoringIntegration();
  public readonly retry = new AuditRetryMonitoringIntegration();
  public readonly synchronization = new AuditSynchronizationMonitoringIntegration();
  public readonly projections = new AuditProjectionsMonitoringIntegration();
  public readonly exports = new AuditExportsMonitoringIntegration();
  public readonly anomalies = new AuditAnomaliesMonitoringIntegration();
  public readonly alerts = new AuditAlertsMonitoringIntegration();
  public readonly incidents = new AuditIncidentsMonitoringIntegration();
  public readonly forensic = new AuditForensicMonitoringIntegration();
  public readonly analytics = new AuditAnalyticsMonitoringIntegration();
  public readonly observability = new AuditObservabilityIntegration();

  public enregistrerObservationHttp(observation: MonitoringContext): void {
    this.observability.enregistrerObservation({ ...observation });
  }

  public obtenirSnapshot(): MonitoringAuditSnapshot {
    const alerts = this.alerts.detecter();
    const observations = this.observability.listerObservations();

    return {
      metrics: this.metrics.collecter(),
      traces: this.traces.lister(),
      alerts,
      incidents: this.incidents.construireDepuisAlertes(alerts, observations),
      observations,
      observability: this.observability.capturer(),
      queues: this.queues.obtenirSnapshot(),
      workers: this.workers.obtenirSnapshot(),
      replay: this.replay.obtenirSnapshot(),
      retry: this.retry.obtenirSnapshot(),
      synchronization: this.synchronization.obtenirSnapshot(),
      projections: this.projections.obtenirSnapshot(),
      exports: this.exports.obtenirSnapshot(),
      anomalies: this.anomalies.detecter(),
      analytics: this.analytics.obtenirSnapshot(),
      forensic: this.forensic.obtenirSnapshot(observations),
    };
  }
}
