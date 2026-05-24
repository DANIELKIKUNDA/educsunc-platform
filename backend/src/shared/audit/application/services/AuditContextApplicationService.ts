// Ce service applicatif orchestre une famille de workflows Audit.
export class AuditContextApplicationService {
  public async enrichirContexteRuntime(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    return { ...payload, sourceAudit: payload.sourceAudit ?? 'APPLICATION', modeOffline: payload.modeOffline === true };
  }
  public async enrichirContexteTenant(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    return { ...payload, scope: payload.scope ?? (payload.ecoleId ? 'ECOLE' : 'ORGANISATION') };
  }
  public async enrichirContexteSecurite(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    return { ...payload, permissionsActives: payload.permissionsActives ?? [], scopesActifs: payload.scopesActifs ?? [] };
  }
}
