import type { SharedBusEventMetadata } from '../../../../infrastructure/bus';
import type {
  AuthAuditConnectionEvent,
  AuthAuditFailureEvent,
  AuthAuditSecurityAction,
} from '../AuthAuditIntegrationTypes';

type MappedAuthAuditEvent = {
  eventName: string;
  payload: Record<string, unknown>;
  metadata: Partial<SharedBusEventMetadata>;
};

function extraireChaine(details: Record<string, unknown> | undefined, cle: string): string | undefined {
  const valeur = details?.[cle];
  return typeof valeur === 'string' && valeur.trim() !== '' ? valeur : undefined;
}

function extraireBooleen(details: Record<string, unknown> | undefined, cle: string): boolean | undefined {
  const valeur = details?.[cle];
  return typeof valeur === 'boolean' ? valeur : undefined;
}

export class AuthAuditEventMapper {
  public static depuisConnexion(event: AuthAuditConnectionEvent): MappedAuthAuditEvent {
    return {
      eventName: 'UserLoggedIn',
      payload: {
        utilisateurId: event.utilisateurId,
        sessionId: event.sessionId,
        organisationActiveId: event.organisationActiveId,
        ecoleActiveId: event.ecoleActiveId,
        deviceId: event.deviceId,
        adresseIp: event.adresseIp,
        userAgent: event.userAgent,
        estOffline: event.estOffline,
      },
      metadata: {
        utilisateurId: event.utilisateurId,
        sessionId: event.sessionId,
        organisationId: event.organisationActiveId,
        ecoleId: event.ecoleActiveId,
        deviceId: event.deviceId,
        occurredAt: new Date().toISOString(),
      },
    };
  }

  public static depuisEchec(event: AuthAuditFailureEvent): MappedAuthAuditEvent {
    const eventName =
      /verrouill|lock/i.test(event.raison)
        ? 'UserLoginLocked'
        : 'LoginFailed';

    return {
      eventName,
      payload: {
        email: event.email,
        utilisateurId: event.utilisateurId,
        sessionId: event.sessionId,
        organisationActiveId: event.organisationActiveId,
        ecoleActiveId: event.ecoleActiveId,
        raison: event.raison,
        deviceId: event.deviceId,
        adresseIp: event.adresseIp,
        userAgent: event.userAgent,
      },
      metadata: {
        utilisateurId: event.utilisateurId,
        sessionId: event.sessionId,
        organisationId: event.organisationActiveId,
        ecoleId: event.ecoleActiveId,
        deviceId: event.deviceId,
        occurredAt: new Date().toISOString(),
      },
    };
  }

  public static depuisAction(action: AuthAuditSecurityAction): MappedAuthAuditEvent {
    const details = action.details;
    const mapping: Record<string, string> = {
      AUTH_LOGOUT: 'UserLoggedOut',
      AUTH_REFRESH: 'RefreshTokenUsed',
      AUTH_REFRESH_REVOKED: 'RefreshTokenRevoked',
      AUTH_REVOKE_ALL_SESSIONS: 'SessionRevoked',
      AUTH_SESSION_REVOKED: 'SessionRevoked',
      AUTH_CONTEXT_CHANGED: 'ContextChanged',
      AUTH_OFFLINE_PREPAREE: 'AuthOfflinePrepared',
    };
    const eventName = mapping[action.action] ?? action.action;

    return {
      eventName,
      payload: {
        action: action.action,
        succes: action.succes,
        ...details,
      },
      metadata: {
        utilisateurId: action.utilisateurId,
        sessionId: extraireChaine(details, 'sessionId'),
        organisationId:
          extraireChaine(details, 'organisationActiveId') ?? extraireChaine(details, 'organisationId'),
        ecoleId: extraireChaine(details, 'ecoleActiveId') ?? extraireChaine(details, 'ecoleId'),
        deviceId: extraireChaine(details, 'deviceId'),
        replayId: extraireChaine(details, 'replayId'),
        retryCount: typeof details?.retryCount === 'number' ? details.retryCount : 0,
        retryReason: extraireChaine(details, 'retryReason'),
        occurredAt: new Date().toISOString(),
        actionTimestamp: extraireChaine(details, 'actionTimestamp'),
        syncTimestamp: extraireBooleen(details, 'estOffline') ? new Date().toISOString() : undefined,
      },
    };
  }
}
