import type { AuditDeadLetterEvent, AuditEventEnvelope } from '../EventBusTypes';
import { obtenirAuditEventMemoryStore } from '../stores/AuditEventMemoryStore';

// Cette dead-letter conserve les echecs definitifs pour investigation, replay manuel et supervision.
export class AuditDeadLetterQueue {
  public ajouter(envelope: AuditEventEnvelope, reason: string): void {
    const deadLetter: AuditDeadLetterEvent = {
      envelope,
      reason,
      failedAt: new Date().toISOString(),
    };
    obtenirAuditEventMemoryStore().deadLetters.push(deadLetter);
  }

  public lister(): AuditDeadLetterEvent[] {
    return [...obtenirAuditEventMemoryStore().deadLetters];
  }
}

