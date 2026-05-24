// Ce service applicatif orchestre une famille de workflows Audit.
export class AuditProjectionApplicationService {
  public async projeterAudit(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    return { ...payload, projection: 'AUDIT' };
  }
  public async projeterAnalytics(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    return { ...payload, projection: 'ANALYTICS' };
  }
}
