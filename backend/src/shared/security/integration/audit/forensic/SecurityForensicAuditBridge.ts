import type { SecurityAuditEvent } from '../SecurityAuditIntegrationTypes';

export class SecurityForensicAuditBridge {
  public enrichir(event: SecurityAuditEvent): SecurityAuditEvent {
    return event;
  }
}
