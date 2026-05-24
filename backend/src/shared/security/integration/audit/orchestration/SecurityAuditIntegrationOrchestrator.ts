import { SecurityAnomalyAuditBridge } from '../anomalies/SecurityAnomalyAuditBridge';
import { SecurityForensicAuditBridge } from '../forensic/SecurityForensicAuditBridge';
import { SecurityMonitoringAuditBridge } from '../monitoring/SecurityMonitoringAuditBridge';
import { SecurityObservabilityAuditBridge } from '../observability/SecurityObservabilityAuditBridge';
import { SecurityAuditEventPublisher } from '../publishers/SecurityAuditEventPublisher';
import type { SecurityAuditEvent } from '../SecurityAuditIntegrationTypes';

export class SecurityAuditIntegrationOrchestrator {
  private readonly publisher = new SecurityAuditEventPublisher();
  private readonly forensic = new SecurityForensicAuditBridge();
  private readonly monitoring = new SecurityMonitoringAuditBridge();
  private readonly observability = new SecurityObservabilityAuditBridge();
  private readonly anomalies = new SecurityAnomalyAuditBridge();

  public async publier(event: SecurityAuditEvent): Promise<void> {
    const enriched = this.observability.enrichir(
      this.forensic.enrichir(
        this.anomalies.normaliser(event),
      ),
    );
    this.monitoring.marquer(enriched);
    await this.publisher.publier(enriched);
  }

  public obtenirMonitoring() {
    return this.monitoring.obtenirSnapshot();
  }
}
