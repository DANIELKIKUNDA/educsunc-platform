import type {
  AuthAuditConnectionEvent,
  AuthAuditFailureEvent,
  AuthAuditSecurityAction,
} from '../AuthAuditIntegrationTypes';

export class AuthObservabilityAuditBridge {
  public enrichirConnexion(event: AuthAuditConnectionEvent): AuthAuditConnectionEvent {
    return event;
  }

  public enrichirEchec(event: AuthAuditFailureEvent): AuthAuditFailureEvent {
    return event;
  }

  public enrichirAction(action: AuthAuditSecurityAction): AuthAuditSecurityAction {
    return action;
  }
}
