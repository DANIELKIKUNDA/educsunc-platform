import type { AuditEventEnvelope } from '../EventBusTypes';
import type { AuditEventHandler } from '../handlers/AuditEventHandler';

// Ce consumer reserve la place des workflows sync/replay/retry sans les lier encore a un moteur externe.
export class AuditSynchronizationEventConsumer implements AuditEventHandler {
  public readonly eventNames = [
    'AuditSynchronizationCompleted',
    'AuditOfflineEntryCaptured',
    'AuditReplayDetected',
    'AuditConflictDetected',
  ] as const;

  public async handle(envelope: AuditEventEnvelope): Promise<void> {
    void envelope;
  }
}

