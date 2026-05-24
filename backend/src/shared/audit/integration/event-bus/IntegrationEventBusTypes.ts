import type { AuditContext } from '../../context';
import type { SharedBusEventEnvelope } from '../../../infrastructure/bus';

export interface AuditIntegrationEventMetadata {
  readonly requestId?: string;
  readonly correlationId?: string;
  readonly traceId?: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly replayId?: string;
  readonly retryCount: number;
  readonly syncId?: string;
  readonly occurredAt: string;
}

export interface AuditIntegrationPublishRequest {
  readonly name: string;
  readonly payload: Record<string, unknown>;
  readonly auditContext?: AuditContext;
}

export interface AuditIntegrationSubscriber {
  readonly eventNames: readonly string[];
  handle(envelope: SharedBusEventEnvelope): Promise<void>;
}

