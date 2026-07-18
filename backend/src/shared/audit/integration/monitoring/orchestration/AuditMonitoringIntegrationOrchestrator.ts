import { MonitoringAuditIntegrationOrchestrator } from 'shared/monitoring';
import type {
  AuditMonitoringIntegrationSnapshot,
  AuditMonitoringObservationInput,
} from '../AuditMonitoringIntegrationTypes';
import { AuditEventBusObservability } from '../../event-bus/observability/AuditEventBusObservability';

export class AuditMonitoringIntegrationOrchestrator {
  public constructor(
    private readonly monitoring = new MonitoringAuditIntegrationOrchestrator(),
    private readonly eventBus = new AuditEventBusObservability(),
  ) {}

  public enregistrerObservationHttp(observation: AuditMonitoringObservationInput): void {
    this.monitoring.enregistrerObservationHttp(observation);
  }

  public async capturerSnapshot(): Promise<AuditMonitoringIntegrationSnapshot> {
    return {
      monitoring: await this.monitoring.obtenirSnapshot(),
      eventBus: this.eventBus.obtenirSnapshot(),
    };
  }
}
