// Ce service applicatif orchestre une famille de workflows Audit.
export class AuditCorrelationApplicationService {
  public async attacherCorrelation(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    return { ...payload, correlationId: payload.correlationId ?? `corr-${Date.now()}` };
  }
  public async attacherRequestId(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    return { ...payload, requestId: payload.requestId ?? `req-${Date.now()}` };
  }
}
