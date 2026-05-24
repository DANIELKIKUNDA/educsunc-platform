import type { AuditIdempotencyRecord } from '../../../../domain/repositories';
import type { AuditIdempotencyRow } from './AuditPersistenceRecords';

// Ce mapper garde les structures d'idempotence simples et deterministes.
export class AuditIdempotencyMapper {
  public static versRow(record: AuditIdempotencyRecord, id = 0): AuditIdempotencyRow {
    return {
      id,
      cle_idempotence: record.cleIdempotence,
      audit_entry_id: record.idAuditEntry,
      date_creation: record.dateCreation.toISOString(),
    };
  }

  public static depuisRow(row: AuditIdempotencyRow): AuditIdempotencyRecord {
    return {
      cleIdempotence: row.cle_idempotence,
      idAuditEntry: row.audit_entry_id,
      dateCreation: new Date(row.date_creation),
      estReplay: false,
      estRetry: false,
    };
  }
}
