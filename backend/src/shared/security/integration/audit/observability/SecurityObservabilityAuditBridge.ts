import type { SecurityAuditEvent } from '../SecurityAuditIntegrationTypes';

export class SecurityObservabilityAuditBridge {
  public enrichir(event: SecurityAuditEvent): SecurityAuditEvent {
    return event;
  }
}
