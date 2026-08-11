import type { AuditEntry } from '../../domain/aggregates';
import {
  AUDIT_CANONICAL_SCHEMA_VERSION,
  type AuditCanonicalEvent,
} from '../../application/outbox';
import type { AuditCanonicalEventFactoryPort } from '../../application/ports/outbound';
import { AuditEntryPersistenceMapper } from '../persistence/postgres/mappers/AuditEntryPersistenceMapper';
import type { AuditEntryRow } from '../persistence/postgres/mappers/AuditPersistenceRecords';

export class AuditCanonicalEventMapper implements AuditCanonicalEventFactoryPort {
  public creer(entree: AuditEntry, idempotencyKey: string): AuditCanonicalEvent {
    return AuditCanonicalEventMapper.depuisAuditEntry(entree, idempotencyKey);
  }

  public static depuisAuditEntry(entree: AuditEntry, idempotencyKey: string): AuditCanonicalEvent {
    const { auditEntry, categories } = AuditEntryPersistenceMapper.versRows(entree);
    return {
      eventId: auditEntry.id_audit_entry,
      eventType: 'AuditEntryCreated',
      schemaVersion: AUDIT_CANONICAL_SCHEMA_VERSION,
      idempotencyKey,
      occurredAt: auditEntry.date_action,
      action: auditEntry.action,
      typePrincipal: auditEntry.type_principal,
      categories: categories.map((categorie) => categorie.categorie),
      gravite: auditEntry.gravite,
      resultat: auditEntry.resultat,
      acteur: {
        id: auditEntry.acteur_id ?? undefined,
        type: auditEntry.type_acteur,
        role: auditEntry.role_actif ?? undefined,
      },
      origine: {
        source: auditEntry.source_audit,
        runtime: auditEntry.source_runtime ?? undefined,
      },
      tenant: {
        scope: auditEntry.scope,
        organisationId: auditEntry.organisation_id ?? undefined,
        ecoleId: auditEntry.ecole_id ?? undefined,
      },
      ressource: auditEntry.type_ressource ? {
        type: auditEntry.type_ressource,
        id: auditEntry.id_ressource ?? undefined,
        libelle: auditEntry.libelle_ressource ?? undefined,
      } : undefined,
      requestId: auditEntry.request_id ?? undefined,
      correlationId: auditEntry.correlation_id ?? undefined,
      metadata: auditEntry.metadata,
      ancienEtat: auditEntry.ancien_etat,
      nouvelEtat: auditEntry.nouvel_etat,
      auditEntry,
    };
  }

  public static versAuditEntry(event: AuditCanonicalEvent): AuditEntry {
    const row: AuditEntryRow = { ...event.auditEntry };
    const categories = event.categories.map((categorie, index) => ({
      id: index + 1,
      audit_entry_id: event.eventId,
      categorie,
    }));
    return AuditEntryPersistenceMapper.depuisRows(row, categories);
  }
}
