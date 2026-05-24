import type { AuthAuditFailureEvent, AuthAuditSecurityAction } from '../AuthAuditIntegrationTypes';

export class AuthAnomalyAuditBridge {
  public normaliserEchec(event: AuthAuditFailureEvent): AuthAuditFailureEvent {
    return event;
  }

  public normaliserAction(action: AuthAuditSecurityAction): AuthAuditSecurityAction {
    return action;
  }
}
