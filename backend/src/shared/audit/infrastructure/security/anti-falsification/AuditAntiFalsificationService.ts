import { obtenirAuditEventMemoryStore } from '../../event-bus';
import type { AuditSecurityIncident } from '../SecurityTypes';

// Cette couche repère les événements suspects ou incohérents qui menaceraient la preuve historique.
export class AuditAntiFalsificationService {
  public detecter(): AuditSecurityIncident[] {
    const incidents: AuditSecurityIncident[] = [];
    const vus = new Set<string>();

    for (const event of obtenirAuditEventMemoryStore().events) {
      if (vus.has(event.metadata.eventId) && !event.metadata.replay && event.metadata.retryCount === 0) {
        incidents.push({
          code: 'EVENT_DUPLICATION_SUSPECTE',
          message: `L événement ${event.metadata.eventId} apparaît plusieurs fois sans replay/retry déclaré.`,
          severite: 'CRITIQUE',
          contexte: { eventId: event.metadata.eventId },
        });
      }
      vus.add(event.metadata.eventId);
    }

    return incidents;
  }
}
