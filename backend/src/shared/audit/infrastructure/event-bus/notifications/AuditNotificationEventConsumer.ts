import type { AuditEventEnvelope } from '../EventBusTypes';
import type { AuditEventHandler } from '../handlers/AuditEventHandler';

// Les notifications futures restent decouplees mais le routage event-driven est deja prepare.
export class AuditNotificationEventConsumer implements AuditEventHandler {
  public readonly eventNames = [
    'AuditMassiveExportDetected',
    'AuditSecurityCriticalDetected',
  ] as const;

  public async handle(envelope: AuditEventEnvelope): Promise<void> {
    void envelope;
  }
}

