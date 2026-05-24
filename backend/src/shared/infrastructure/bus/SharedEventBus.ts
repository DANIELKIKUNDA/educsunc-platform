import { randomUUID } from 'node:crypto';
import type {
  SharedBusEventEnvelope,
  SharedBusEventHandler,
  SharedBusEventMetadata,
} from './SharedEventBusTypes';

type SharedEventBusState = {
  events: SharedBusEventEnvelope[];
  handlers: Map<string, SharedBusEventHandler[]>;
};

const state: SharedEventBusState = {
  events: [],
  handlers: new Map<string, SharedBusEventHandler[]>(),
};

// Ce bus partage centralise la publication evenementielle transversale sans imposer un broker externe en V1.
export class SharedEventBus {
  public enregistrer(handler: SharedBusEventHandler): void {
    for (const eventName of handler.eventNames) {
      const current = state.handlers.get(eventName) ?? [];
      current.push(handler);
      state.handlers.set(eventName, current);
    }
  }

  public async publier(
    name: string,
    payload: Record<string, unknown>,
    metadata: Partial<SharedBusEventMetadata> = {},
  ): Promise<SharedBusEventEnvelope> {
    const envelope: SharedBusEventEnvelope = {
      name,
      payload,
      metadata: {
        eventId: metadata.eventId ?? randomUUID(),
        requestId: metadata.requestId,
        correlationId: metadata.correlationId,
        parentCorrelationId: metadata.parentCorrelationId,
        workflowId: metadata.workflowId,
        causationId: metadata.causationId,
        traceId: metadata.traceId,
        spanId: metadata.spanId,
        parentSpanId: metadata.parentSpanId,
        organisationId: metadata.organisationId,
        ecoleId: metadata.ecoleId,
        scope: metadata.scope,
        sessionId: metadata.sessionId,
        utilisateurId: metadata.utilisateurId,
        deviceId: metadata.deviceId,
        appVersion: metadata.appVersion,
        plateforme: metadata.plateforme,
        syncId: metadata.syncId,
        replayId: metadata.replayId,
        replayReason: metadata.replayReason,
        replaySource: metadata.replaySource,
        replayTimestamp: metadata.replayTimestamp,
        retryCount: metadata.retryCount ?? 0,
        retryReason: metadata.retryReason,
        retryBackoffMs: metadata.retryBackoffMs,
        retryHistory: metadata.retryHistory ?? [],
        occurredAt: metadata.occurredAt ?? new Date().toISOString(),
        actionTimestamp: metadata.actionTimestamp,
        syncTimestamp: metadata.syncTimestamp,
        retryTimestamp: metadata.retryTimestamp,
      },
    };

    state.events.push(envelope);
    for (const handler of state.handlers.get(name) ?? []) {
      await handler.handle(envelope);
    }

    return envelope;
  }

  public lister(): readonly SharedBusEventEnvelope[] {
    return state.events;
  }
}

let singleton: SharedEventBus | null = null;

export function obtenirSharedEventBus(): SharedEventBus {
  if (!singleton) {
    singleton = new SharedEventBus();
  }
  return singleton;
}

export function reinitialiserSharedEventBus(): void {
  state.events.length = 0;
  state.handlers.clear();
  singleton = null;
}
