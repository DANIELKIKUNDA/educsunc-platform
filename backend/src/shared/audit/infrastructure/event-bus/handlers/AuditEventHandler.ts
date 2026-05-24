import type { AuditEventEnvelope } from '../EventBusTypes';

export interface AuditEventHandler {
  readonly eventNames: readonly string[];
  handle(envelope: AuditEventEnvelope): Promise<void>;
}

