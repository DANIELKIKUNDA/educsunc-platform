import type {
  AuthAuditConnectionEvent,
  AuthAuditFailureEvent,
  AuthAuditSecurityAction,
} from '../AuthAuditIntegrationTypes';

export class AuthForensicAuditBridge {
  public enrichirConnexion(event: AuthAuditConnectionEvent): AuthAuditConnectionEvent {
    return {
      ...event,
      adresseIp: event.adresseIp,
      userAgent: event.userAgent,
    };
  }

  public enrichirEchec(event: AuthAuditFailureEvent): AuthAuditFailureEvent {
    return event;
  }

  public enrichirAction(action: AuthAuditSecurityAction): AuthAuditSecurityAction {
    return action;
  }
}
