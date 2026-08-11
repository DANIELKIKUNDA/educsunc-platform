export const AUDIT_CANONICAL_SCHEMA_VERSION = 1;

export interface AuditCanonicalEntryPayload {
  readonly id_audit_entry: string;
  readonly action: string;
  readonly type_principal: string;
  readonly gravite: string;
  readonly niveau: string;
  readonly resultat: string;
  readonly request_id: string | null;
  readonly correlation_id: string | null;
  readonly session_id: string | null;
  readonly sync_id: string | null;
  readonly replay_id: string | null;
  readonly acteur_id: string | null;
  readonly type_acteur: string;
  readonly role_actif: string | null;
  readonly type_ressource: string | null;
  readonly id_ressource: string | null;
  readonly libelle_ressource: string | null;
  readonly organisation_id: string | null;
  readonly ecole_id: string | null;
  readonly scope: string;
  readonly mode_offline: boolean;
  readonly statut_synchronisation: string | null;
  readonly retry_count: number;
  readonly est_replay: boolean;
  readonly est_retry: boolean;
  readonly adresse_ip: string | null;
  readonly user_agent: string | null;
  readonly device_id: string | null;
  readonly source_audit: string;
  readonly source_runtime: string | null;
  readonly version_application: string | null;
  readonly date_action: string;
  readonly date_creation_audit: string;
  readonly date_synchronisation: string | null;
  readonly ancien_etat: unknown;
  readonly nouvel_etat: unknown;
  readonly metadata: unknown;
  readonly contexte_permissions: unknown;
  readonly contexte_execution: unknown;
}

// Ce contrat serialisable est l'unique message durable emis apres l'ecriture append-only.
export interface AuditCanonicalEvent {
  readonly eventId: string;
  readonly eventType: 'AuditEntryCreated';
  readonly schemaVersion: typeof AUDIT_CANONICAL_SCHEMA_VERSION;
  readonly idempotencyKey: string;
  readonly occurredAt: string;
  readonly action: string;
  readonly typePrincipal: string;
  readonly categories: readonly string[];
  readonly gravite: string;
  readonly resultat: string;
  readonly acteur: {
    readonly id?: string;
    readonly type: string;
    readonly role?: string;
  };
  readonly origine: {
    readonly source: string;
    readonly runtime?: string;
  };
  readonly tenant: {
    readonly scope: string;
    readonly organisationId?: string;
    readonly ecoleId?: string;
  };
  readonly ressource?: {
    readonly type: string;
    readonly id?: string;
    readonly libelle?: string;
  };
  readonly requestId?: string;
  readonly correlationId?: string;
  readonly metadata?: unknown;
  readonly ancienEtat?: unknown;
  readonly nouvelEtat?: unknown;
  readonly auditEntry: AuditCanonicalEntryPayload;
}

export type AuditOutboxStatus = 'PENDING' | 'PROCESSING' | 'RETRY' | 'PUBLISHED' | 'DEAD';

export interface AuditOutboxMessage {
  readonly idOutbox: string;
  readonly event: AuditCanonicalEvent;
  readonly status: AuditOutboxStatus;
  readonly attemptCount: number;
  readonly nextAttemptAt: string;
  readonly lockedAt?: string;
  readonly lockedBy?: string;
  readonly lastError?: string;
  readonly createdAt: string;
  readonly publishedAt?: string;
}

export interface AuditCanonicalWriteResult {
  readonly eventId: string;
  readonly idOutbox: string;
  readonly duplicate: boolean;
}
