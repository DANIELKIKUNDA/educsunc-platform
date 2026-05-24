import { AuthAnomalyAuditBridge } from '../anomalies/AuthAnomalyAuditBridge';
import { AuthDeviceAuditBridge } from '../devices/AuthDeviceAuditBridge';
import { AuthForensicAuditBridge } from '../forensic/AuthForensicAuditBridge';
import { AuthMonitoringAuditBridge } from '../monitoring/AuthMonitoringAuditBridge';
import { AuthObservabilityAuditBridge } from '../observability/AuthObservabilityAuditBridge';
import { AuthAuditEventPublisher } from '../publishers/AuthAuditEventPublisher';
import { AuthSessionAuditBridge } from '../sessions/AuthSessionAuditBridge';
import type {
  AuthAuditConnectionEvent,
  AuthAuditFailureEvent,
  AuthAuditSecurityAction,
} from '../AuthAuditIntegrationTypes';

export class AuthAuditIntegrationOrchestrator {
  private readonly publisher = new AuthAuditEventPublisher();
  private readonly sessions = new AuthSessionAuditBridge();
  private readonly devices = new AuthDeviceAuditBridge();
  private readonly anomalies = new AuthAnomalyAuditBridge();
  private readonly forensic = new AuthForensicAuditBridge();
  private readonly monitoring = new AuthMonitoringAuditBridge();
  private readonly observability = new AuthObservabilityAuditBridge();

  public async publierConnexion(event: AuthAuditConnectionEvent): Promise<void> {
    const enriched = this.observability.enrichirConnexion(
      this.forensic.enrichirConnexion(
        this.devices.enrichirConnexion(
          this.sessions.enrichirConnexion(event),
        ),
      ),
    );
    this.monitoring.marquerConnexion();
    await this.publisher.publierConnexion(enriched);
  }

  public async publierEchec(event: AuthAuditFailureEvent): Promise<void> {
    const enriched = this.observability.enrichirEchec(
      this.forensic.enrichirEchec(
        this.anomalies.normaliserEchec(
          this.devices.enrichirEchec(
            this.sessions.enrichirEchec(event),
          ),
        ),
      ),
    );
    this.monitoring.marquerEchec();
    await this.publisher.publierEchec(enriched);
  }

  public async publierAction(action: AuthAuditSecurityAction): Promise<void> {
    const enriched = this.observability.enrichirAction(
      this.forensic.enrichirAction(
        this.anomalies.normaliserAction(
          this.devices.enrichirAction(
            this.sessions.enrichirAction(action),
          ),
        ),
      ),
    );
    this.monitoring.marquerAction(enriched);
    await this.publisher.publierAction(enriched);
  }

  public obtenirMonitoring() {
    return this.monitoring.obtenirSnapshot();
  }
}
