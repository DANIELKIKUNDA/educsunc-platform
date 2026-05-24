import type { SharedBusEventMetadata } from '../../../../infrastructure/bus';
import type { SecurityAuditEvent } from '../SecurityAuditIntegrationTypes';

type MappedSecurityAuditEvent = {
  eventName: string;
  payload: Record<string, unknown>;
  metadata: Partial<SharedBusEventMetadata>;
};

function extraireChaine(details: Record<string, unknown> | undefined, cle: string): string | undefined {
  const valeur = details?.[cle];
  return typeof valeur === 'string' && valeur.trim() !== '' ? valeur : undefined;
}

export class SecurityAuditEventMapper {
  public static mapper(event: SecurityAuditEvent): MappedSecurityAuditEvent {
    const eventName = SecurityAuditEventMapper.resoudreNom(event);
    return {
      eventName,
      payload: {
        action: event.action,
        succes: event.succes,
        ...event.details,
      },
      metadata: {
        utilisateurId: event.idUtilisateur,
        organisationId:
          extraireChaine(event.details, 'idOrganisation')
          ?? extraireChaine(event.details, 'organisationActiveId'),
        ecoleId:
          extraireChaine(event.details, 'idEcole')
          ?? extraireChaine(event.details, 'ecoleActiveId'),
        scope: extraireChaine(event.details, 'scope'),
        sessionId: extraireChaine(event.details, 'sessionId'),
        deviceId: extraireChaine(event.details, 'deviceId'),
        occurredAt: new Date().toISOString(),
      },
    };
  }

  private static resoudreNom(event: SecurityAuditEvent): string {
    if (event.action === 'SECURITY_PERMISSION_GRANTED') {
      return 'PermissionGranted';
    }
    if (event.action === 'SECURITY_PERMISSION_DENIED') {
      return 'PermissionDenied';
    }
    if (event.action === 'SECURITY_SCOPE_CHANGED') {
      return 'ScopeChanged';
    }
    if (event.action === 'SECURITY_SCOPE_DENIED') {
      return 'ScopeDenied';
    }
    if (event.action === 'SECURITY_RESTRICTION_TRIGGERED') {
      return 'RestrictionTriggered';
    }
    if (event.action === 'SECURITY_INCIDENT_DETECTED') {
      return 'SecurityIncidentDetected';
    }
    if (event.action === 'SECURITY_TITULARIAT_CHANGED') {
      return 'TitulariatChanged';
    }
    if (event.action === 'SECURITY_CONTEXT_CHANGED') {
      return 'SecurityContextChanged';
    }
    return event.action;
  }
}
