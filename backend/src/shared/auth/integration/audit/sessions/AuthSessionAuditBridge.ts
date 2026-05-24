import type {
  AuthAuditConnectionEvent,
  AuthAuditFailureEvent,
  AuthAuditSecurityAction,
} from '../AuthAuditIntegrationTypes';

export class AuthSessionAuditBridge {
  public enrichirConnexion(event: AuthAuditConnectionEvent): AuthAuditConnectionEvent {
    return {
      ...event,
      sessionId: event.sessionId,
    };
  }

  public enrichirEchec(event: AuthAuditFailureEvent): AuthAuditFailureEvent {
    return event;
  }

  public enrichirAction(action: AuthAuditSecurityAction): AuthAuditSecurityAction {
    return action;
  }
}
