import type { AuditArchiveRecord } from '../../../../domain/repositories';
import type { AuditArchiveRow } from './AuditPersistenceRecords';
import type { AuditArchiveStatusReadModel } from '../../../../application/read-models/consultation/AuditArchiveStatusReadModel';

// Ce mapper conserve l'information d'archive sans la confondre avec une suppression.
export class AuditArchiveMapper {
  public static versRow(record: AuditArchiveRecord): AuditArchiveRow {
    return {
      id_archive: record.idArchive,
      audit_entry_id: record.idAuditEntry,
      date_archivage: record.dateArchivage.toISOString(),
      raison_archivage: record.raisonArchivage ?? null,
      type_archive: record.typeArchive,
    };
  }

  public static depuisRow(row: AuditArchiveRow): AuditArchiveRecord {
    return {
      idArchive: row.id_archive,
      idAuditEntry: row.audit_entry_id,
      dateArchivage: new Date(row.date_archivage),
      raisonArchivage: row.raison_archivage ?? undefined,
      typeArchive: row.type_archive,
    };
  }

  public static versReadModel(row: AuditArchiveRow): AuditArchiveStatusReadModel {
    return {
      archiveId: row.id_archive,
      statut: row.type_archive,
    };
  }
}
