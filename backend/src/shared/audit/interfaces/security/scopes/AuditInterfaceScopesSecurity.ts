import type { AuditInterfaceAuthorizationPolicy, AuditSecuritySurface } from '../SecurityInterfaceTypes';

const SCOPES_BY_SURFACE: Record<AuditSecuritySurface, readonly string[]> = {
  AUTH: [],
  FORENSIC: ['ORGANISATION', 'ECOLE', 'FORENSIC'],
  REPLAY: ['ORGANISATION', 'ECOLE', 'REPLAY'],
  RETRY: ['ORGANISATION', 'ECOLE', 'REPLAY'],
  SYNCHRONIZATION: ['ORGANISATION', 'ECOLE'],
  EXPORTS: ['ORGANISATION', 'ECOLE', 'EXPORTS'],
  MONITORING: ['ORGANISATION', 'ECOLE', 'MONITORING'],
  WORKERS: ['ORGANISATION', 'ECOLE', 'MONITORING'],
  QUEUES: ['ORGANISATION', 'ECOLE', 'MONITORING'],
  INCIDENTS: ['ORGANISATION', 'ECOLE', 'FORENSIC'],
  ANOMALIES: ['ORGANISATION', 'ECOLE', 'MONITORING'],
  RETENTION: ['ORGANISATION', 'ECOLE', 'EXPORTS'],
  RUNTIME: ['ORGANISATION', 'ECOLE', 'MONITORING'],
};

export class AuditInterfaceScopesSecurity {
  public static creerPolicy(surface: AuditSecuritySurface): AuditInterfaceAuthorizationPolicy {
    return {
      permissions: [],
      scopes: SCOPES_BY_SURFACE[surface],
      restreindreTenant: surface !== 'AUTH',
    };
  }

  public static scopesDe(surface: AuditSecuritySurface): readonly string[] {
    return this.creerPolicy(surface).scopes;
  }
}

