import type { AuditEventEnvelope } from '../EventBusTypes';
import type { AuditEventHandler } from '../handlers/AuditEventHandler';

// Ce dispatcher route les evenements vers les handlers specialises sans contenir de logique metier profonde.
export class AuditEventDispatcher {
  private readonly handlers = new Map<string, AuditEventHandler[]>();

  public enregistrer(handler: AuditEventHandler): void {
    for (const eventName of handler.eventNames) {
      const current = this.handlers.get(eventName) ?? [];
      current.push(handler);
      this.handlers.set(eventName, current);
    }
  }

  public async dispatch(envelope: AuditEventEnvelope): Promise<void> {
    for (const handler of this.handlers.get(envelope.name) ?? []) {
      await handler.handle(envelope);
    }
  }
}

