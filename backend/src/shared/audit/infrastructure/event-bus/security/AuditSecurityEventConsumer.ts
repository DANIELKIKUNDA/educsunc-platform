import type { AuditEventEnvelope } from '../EventBusTypes';
import type { AuditEventHandler } from '../handlers/AuditEventHandler';

// Ce consumer garde une accroche technique pour les reactions securite sans coupler le bus a la logique metier.
export class AuditSecurityEventConsumer implements AuditEventHandler {
  public readonly eventNames = [
    'AuditSecurityCriticalDetected',
    'AuditRepeatedSecurityFailureDetected',
    'AuditSensitiveActionDetected',
  ] as const;

  public async handle(envelope: AuditEventEnvelope): Promise<void> {
    void envelope;
  }
}

