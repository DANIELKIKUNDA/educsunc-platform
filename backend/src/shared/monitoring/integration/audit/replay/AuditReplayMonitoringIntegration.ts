import { AuditReplayRuntimeMonitoring } from 'shared/audit/infrastructure/monitoring';

export class AuditReplayMonitoringIntegration {
  public constructor(
    private readonly replay: AuditReplayRuntimeMonitoring = new AuditReplayRuntimeMonitoring(),
  ) {}

  public obtenirSnapshot() {
    return this.replay.obtenirSnapshot();
  }
}
