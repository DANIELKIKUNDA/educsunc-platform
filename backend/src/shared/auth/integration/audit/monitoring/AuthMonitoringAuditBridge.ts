import type { AuthAuditFailureEvent, AuthAuditSecurityAction } from '../AuthAuditIntegrationTypes';

const stats = {
  logins: 0,
  loginFailures: 0,
  refreshes: 0,
  revokedSessions: 0,
};

export class AuthMonitoringAuditBridge {
  public marquerConnexion(): void {
    stats.logins += 1;
  }

  public marquerEchec(): void {
    stats.loginFailures += 1;
  }

  public marquerAction(action: AuthAuditSecurityAction | AuthAuditFailureEvent): void {
    const actionCode = 'action' in action ? action.action : undefined;
    if (actionCode === 'AUTH_REFRESH') {
      stats.refreshes += 1;
    }
    if (actionCode === 'AUTH_REVOKE_ALL_SESSIONS' || actionCode === 'AUTH_SESSION_REVOKED') {
      stats.revokedSessions += 1;
    }
  }

  public obtenirSnapshot() {
    return { ...stats };
  }
}
