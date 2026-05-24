import type { SynchronizationConflictReadModel } from '../../../../application/read-models/offline/SynchronizationConflictReadModel';
import type { AuditSyncConflictRecord } from '../../../../domain/repositories';
import type { AuditSyncConflictRow } from './AuditPersistenceRecords';

// Ce mapper preserve l'historique exact des conflits de synchronisation.
export class AuditSyncConflictMapper {
  public static versRow(record: AuditSyncConflictRecord): AuditSyncConflictRow {
    return {
      id_audit_conflict: record.idAuditConflict,
      audit_entry_id: record.idAuditEntry,
      type_conflit: record.typeConflit,
      description_conflit: record.descriptionConflit ?? null,
      date_detection: record.dateDetection.toISOString(),
      date_resolution: record.dateResolution?.toISOString() ?? null,
      statut_resolution: record.statutResolution,
    };
  }

  public static depuisRow(row: AuditSyncConflictRow): AuditSyncConflictRecord {
    return {
      idAuditConflict: row.id_audit_conflict,
      idAuditEntry: row.audit_entry_id,
      typeConflit: row.type_conflit,
      descriptionConflit: row.description_conflit ?? undefined,
      dateDetection: new Date(row.date_detection),
      dateResolution: row.date_resolution ? new Date(row.date_resolution) : undefined,
      statutResolution: row.statut_resolution,
    };
  }

  public static versReadModel(row: AuditSyncConflictRow): SynchronizationConflictReadModel {
    return {
      auditId: row.audit_entry_id,
      raison: row.type_conflit,
      resolution: row.statut_resolution,
    };
  }
}
