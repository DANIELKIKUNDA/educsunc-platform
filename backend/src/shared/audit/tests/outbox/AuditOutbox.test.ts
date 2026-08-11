import assert from 'node:assert/strict';
import test from 'node:test';
import type {
  AuditCanonicalEvent,
  AuditCanonicalWriteResult,
  AuditOutboxMessage,
} from '../../application/outbox';
import type {
  AuditOutboxPublisherPort,
  AuditOutboxRepositoryPort,
} from '../../application/ports/outbound';
import { AuditOutboxDeliveryService } from '../../application/services';
import { AuditTransactionManager } from '../../infrastructure/persistence/postgres/transaction/AuditTransactionManager';

function canonicalEvent(overrides: Partial<AuditCanonicalEvent> = {}): AuditCanonicalEvent {
  const now = '2026-08-06T08:00:00.000Z';
  return {
    eventId: 'audit-001',
    eventType: 'AuditEntryCreated',
    schemaVersion: 1,
    idempotencyKey: 'payment:001',
    occurredAt: now,
    action: 'PAIEMENT_CREE',
    typePrincipal: 'FINANCIER',
    categories: ['FINANCIER', 'METIER'],
    gravite: 'ELEVEE',
    resultat: 'SUCCESS',
    acteur: { id: 'user-001', type: 'UTILISATEUR', role: 'CAISSIER' },
    origine: { source: 'HTTP_API', runtime: 'HTTP_API' },
    tenant: { scope: 'ECOLE', organisationId: 'org-a', ecoleId: 'ecole-a' },
    ressource: { type: 'PAIEMENT', id: 'paiement-001' },
    requestId: 'req-001',
    correlationId: 'corr-001',
    auditEntry: {
      id_audit_entry: 'audit-001', action: 'PAIEMENT_CREE', type_principal: 'FINANCIER',
      gravite: 'ELEVEE', niveau: 'CRITIQUE', resultat: 'SUCCESS', request_id: 'req-001',
      correlation_id: 'corr-001', session_id: null, sync_id: null, replay_id: null,
      acteur_id: 'user-001', type_acteur: 'UTILISATEUR', role_actif: 'CAISSIER',
      type_ressource: 'PAIEMENT', id_ressource: 'paiement-001', libelle_ressource: 'Paiement',
      organisation_id: 'org-a', ecole_id: 'ecole-a', scope: 'ECOLE', mode_offline: false,
      statut_synchronisation: null, retry_count: 0, est_replay: false, est_retry: false,
      adresse_ip: null, user_agent: null, device_id: null, source_audit: 'HTTP_API',
      source_runtime: 'HTTP_API', version_application: null, date_action: now,
      date_creation_audit: now, date_synchronisation: null, ancien_etat: null,
      nouvel_etat: { montant: 50_000 }, metadata: {}, contexte_permissions: {},
      contexte_execution: {},
    },
    ...overrides,
  };
}

class InMemoryOutbox implements AuditOutboxRepositoryPort {
  public readonly messages = new Map<string, AuditOutboxMessage>();
  private readonly byKey = new Map<string, string>();

  public async ajouter(event: AuditCanonicalEvent): Promise<AuditCanonicalWriteResult> {
    const existingId = this.byKey.get(event.idempotencyKey);
    if (existingId) {
      const existing = this.messages.get(existingId)!;
      if (existing.event.eventId !== event.eventId) throw new Error('Idempotency conflict');
      return { eventId: event.eventId, idOutbox: existingId, duplicate: true };
    }
    const idOutbox = `outbox-${event.eventId}`;
    this.byKey.set(event.idempotencyKey, idOutbox);
    this.messages.set(idOutbox, {
      idOutbox, event, status: 'PENDING', attemptCount: 0,
      nextAttemptAt: new Date(0).toISOString(), createdAt: new Date().toISOString(),
    });
    return { eventId: event.eventId, idOutbox, duplicate: false };
  }

  public async reclamerLot(workerId: string, limit: number): Promise<AuditOutboxMessage[]> {
    const claimed: AuditOutboxMessage[] = [];
    for (const [id, message] of this.messages) {
      if (claimed.length >= limit || !['PENDING', 'RETRY'].includes(message.status)) continue;
      const updated = { ...message, status: 'PROCESSING' as const, lockedBy: workerId };
      this.messages.set(id, updated);
      claimed.push(updated);
    }
    return claimed;
  }

  public async marquerPublie(idOutbox: string, workerId: string): Promise<void> {
    const message = this.locked(idOutbox, workerId);
    this.messages.set(idOutbox, { ...message, status: 'PUBLISHED', publishedAt: new Date().toISOString() });
  }

  public async marquerEchec(
    idOutbox: string,
    workerId: string,
    errorMessage: string,
    nextAttemptAt: Date,
    terminal: boolean,
  ): Promise<void> {
    const message = this.locked(idOutbox, workerId);
    this.messages.set(idOutbox, {
      ...message,
      status: terminal ? 'DEAD' : 'RETRY',
      attemptCount: message.attemptCount + 1,
      nextAttemptAt: nextAttemptAt.toISOString(),
      lastError: errorMessage,
      lockedBy: undefined,
    });
  }

  private locked(id: string, workerId: string): AuditOutboxMessage {
    const message = this.messages.get(id);
    if (!message || message.lockedBy !== workerId) throw new Error('Lock lost');
    return message;
  }
}

test('le contrat canonique conserve le tenant et refuse une seconde identite pour la meme cle', async () => {
  const repository = new InMemoryOutbox();
  const first = canonicalEvent();
  assert.equal((await repository.ajouter(first)).duplicate, false);
  assert.equal((await repository.ajouter(first)).duplicate, true);
  await assert.rejects(
    repository.ajouter(canonicalEvent({ eventId: 'audit-002' })),
    /Idempotency conflict/,
  );
  assert.deepEqual(repository.messages.values().next().value?.event.tenant, {
    scope: 'ECOLE', organisationId: 'org-a', ecoleId: 'ecole-a',
  });
});

test('un echec reste durable puis la reprise publie une seule fois', async () => {
  const repository = new InMemoryOutbox();
  await repository.ajouter(canonicalEvent());
  let attempts = 0;
  const publisher: AuditOutboxPublisherPort = {
    publier: async () => {
      attempts += 1;
      if (attempts === 1) throw new Error('service unavailable token=secret-value');
    },
  };
  const delivery = new AuditOutboxDeliveryService(repository, publisher, () => undefined, 3, 0);
  const first = await delivery.traiterLot('worker-a');
  assert.deepEqual(first, { claimed: 1, published: 0, retries: 1, dead: 0 });
  const failed = repository.messages.get('outbox-audit-001');
  assert.equal(failed?.status, 'RETRY');
  assert.match(failed?.lastError ?? '', /token=\[MASQUE\]/);

  const second = await delivery.traiterLot('worker-b');
  assert.deepEqual(second, { claimed: 1, published: 1, retries: 0, dead: 0 });
  const third = await delivery.traiterLot('worker-c');
  assert.equal(third.claimed, 0);
  assert.equal(attempts, 2);
});

test('deux workers concurrents ne livrent pas deux fois le meme message', async () => {
  const repository = new InMemoryOutbox();
  await repository.ajouter(canonicalEvent());
  let deliveries = 0;
  const publisher: AuditOutboxPublisherPort = { publier: async () => { deliveries += 1; } };
  const workerA = new AuditOutboxDeliveryService(repository, publisher);
  const workerB = new AuditOutboxDeliveryService(repository, publisher);
  await Promise.all([
    workerA.traiterLot('worker-a'),
    workerB.traiterLot('worker-b'),
  ]);
  assert.equal(deliveries, 1);
  assert.equal(repository.messages.get('outbox-audit-001')?.status, 'PUBLISHED');
});

test('un echec irrecuperable reste visible dans l etat terminal sans perte', async () => {
  const repository = new InMemoryOutbox();
  await repository.ajouter(canonicalEvent());
  const publisher: AuditOutboxPublisherPort = {
    publier: async () => { throw new Error('publication definitivement impossible'); },
  };
  const delivery = new AuditOutboxDeliveryService(repository, publisher, () => undefined, 1);
  const result = await delivery.traiterLot('worker-terminal');
  assert.deepEqual(result, { claimed: 1, published: 0, retries: 0, dead: 1 });
  assert.equal(repository.messages.get('outbox-audit-001')?.status, 'DEAD');
});

test('le gestionnaire Audit utilise la transaction du client injecte', async () => {
  const calls: string[] = [];
  const manager = new AuditTransactionManager({
    executer: async () => ({ lignes: [], nombreLignesAffectees: 0 }),
    dansTransaction: async (operation) => {
      calls.push('BEGIN');
      try {
        const result = await operation();
        calls.push('COMMIT');
        return result;
      } catch (error) {
        calls.push('ROLLBACK');
        throw error;
      }
    },
  });
  const result = await manager.executerDansTransaction(async () => 'ok');
  assert.equal(result, 'ok');
  assert.deepEqual(calls, ['BEGIN', 'COMMIT']);
});
