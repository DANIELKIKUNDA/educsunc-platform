import { AUDIT_TEST_TRACES } from '../fixtures/AuditFixtures';

export class AuditTraceFactory {
  public static creer(overrides: Partial<{
    correlationId: string;
    requestId: string;
    traceId: string;
    spanId: string;
  }> = {}) {
    return {
      correlationId: overrides.correlationId ?? AUDIT_TEST_TRACES.correlationId,
      requestId: overrides.requestId ?? AUDIT_TEST_TRACES.requestId,
      traceId: overrides.traceId ?? AUDIT_TEST_TRACES.traceId,
      spanId: overrides.spanId ?? AUDIT_TEST_TRACES.spanId,
    };
  }
}
