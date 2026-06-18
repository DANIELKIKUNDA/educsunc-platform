import type { AuditInterfaceAuthorizationPolicy, AuditSecuritySurface } from '../SecurityInterfaceTypes';

const PERMISSIONS_BY_SURFACE: Record<AuditSecuritySurface, readonly string[]> = {
  AUTH: [],
  FORENSIC: ['forensic.read'],
  REPLAY: ['audit.replay'],
  RETRY: ['audit.retry'],
  SYNCHRONIZATION: ['audit.sync.read'],
  EXPORTS: ['audit.export.read'],
  MONITORING: ['audit.monitoring.read'],
  WORKERS: ['audit.monitoring.read'],
  QUEUES: ['audit.monitoring.read'],
  INCIDENTS: ['audit.security.read'],
  ANOMALIES: ['audit.security.read'],
  RETENTION: ['audit.retention.read'],
  RUNTIME: ['audit.monitoring.read'],
};

export class AuditInterfacePermissionsSecurity {
  public static creerPolicy(surface: AuditSecuritySurface): AuditInterfaceAuthorizationPolicy {
    return {
      permissions: PERMISSIONS_BY_SURFACE[surface],
      scopes: [],
      restreindreTenant: surface !== 'AUTH',
    };
  }

  public static permissionsDe(surface: AuditSecuritySurface): readonly string[] {
    return this.creerPolicy(surface).permissions;
  }
}
