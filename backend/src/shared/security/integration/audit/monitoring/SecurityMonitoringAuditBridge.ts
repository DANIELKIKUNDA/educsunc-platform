import type { SecurityAuditEvent } from '../SecurityAuditIntegrationTypes';

const stats = {
  permissionGranted: 0,
  permissionDenied: 0,
  scopeDenied: 0,
  restrictions: 0,
  incidents: 0,
};

export class SecurityMonitoringAuditBridge {
  public marquer(event: SecurityAuditEvent): void {
    if (event.action === 'SECURITY_PERMISSION_GRANTED') {
      stats.permissionGranted += 1;
    }
    if (event.action === 'SECURITY_PERMISSION_DENIED') {
      stats.permissionDenied += 1;
    }
    if (event.action === 'SECURITY_SCOPE_DENIED') {
      stats.scopeDenied += 1;
    }
    if (event.action === 'SECURITY_RESTRICTION_TRIGGERED') {
      stats.restrictions += 1;
    }
    if (event.action === 'SECURITY_INCIDENT_DETECTED') {
      stats.incidents += 1;
    }
  }

  public obtenirSnapshot() {
    return { ...stats };
  }
}
