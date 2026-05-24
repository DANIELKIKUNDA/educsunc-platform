import type { AuditInterfaceObservabilityPolicy } from '../SecurityInterfaceTypes';

export class AuditInterfaceObservabilitySecurity {
  public static creer(): AuditInterfaceObservabilityPolicy {
    return {
      journaliserRefus: true,
      propagerRequestId: true,
      propagerCorrelationId: true,
      propagerTenant: true,
      propagerDeviceId: true,
    };
  }
}

