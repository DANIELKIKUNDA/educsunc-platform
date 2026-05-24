import type { AuditDeadLetterEvent, AuditEventEnvelope } from '../EventBusTypes';

type AuditEventMemoryState = {
  events: AuditEventEnvelope[];
  deadLetters: AuditDeadLetterEvent[];
  processedEventIds: Set<string>;
};

const state: AuditEventMemoryState = {
  events: [],
  deadLetters: [],
  processedEventIds: new Set<string>(),
};

// Ce store memoire soutient publication, replay et dead-letter du bus Audit.
export function obtenirAuditEventMemoryStore(): AuditEventMemoryState {
  return state;
}

