import { obtenirAuditEventMemoryStore } from '../stores/AuditEventMemoryStore';
import type { AuditEventEnvelope } from '../EventBusTypes';

// Cette garde empeche la double consommation d un meme evenement ou replay non voulu.
export class AuditEventIdempotencyGuard {
  public dejaTraite(envelope: AuditEventEnvelope): boolean {
    return obtenirAuditEventMemoryStore().processedEventIds.has(envelope.metadata.eventId);
  }

  public marquerTraite(envelope: AuditEventEnvelope): void {
    obtenirAuditEventMemoryStore().processedEventIds.add(envelope.metadata.eventId);
  }
}

