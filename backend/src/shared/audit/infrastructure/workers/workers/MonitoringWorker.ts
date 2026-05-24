import { AuditObservabilityService } from '../../monitoring';

export class MonitoringWorker {
  private readonly observability = new AuditObservabilityService();

  public async executer(): Promise<void> {
    void this.observability.capturer();
  }
}
