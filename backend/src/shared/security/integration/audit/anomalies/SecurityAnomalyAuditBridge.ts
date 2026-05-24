import type { SecurityAuditEvent } from '../SecurityAuditIntegrationTypes';

export class SecurityAnomalyAuditBridge {
  public normaliser(event: SecurityAuditEvent): SecurityAuditEvent {
    return event;
  }
}
