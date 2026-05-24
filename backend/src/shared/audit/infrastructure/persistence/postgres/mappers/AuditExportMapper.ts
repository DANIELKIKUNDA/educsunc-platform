import type { AuditExportOutput } from '../../../../application/dto/outputs/AuditExportOutput';
import type { AuditExportItemReadModel } from '../../../../application/read-models/exports/AuditExportItemReadModel';
import type { AuditExportRecord } from '../../../../domain/repositories';
import type { AuditExportRow } from './AuditPersistenceRecords';
import { AuditJsonbMapper } from './AuditJsonbMapper';

// Ce mapper applique le nettoyage et la mise en forme des exports Audit.
export class AuditExportMapper {
  public static versRow(record: AuditExportRecord): AuditExportRow {
    return {
      id_audit_export: record.idAuditExport,
      audit_entry_id: record.idAuditEntry,
      acteur_id: record.acteurId ?? null,
      format_export: record.formatExport,
      nombre_elements: record.nombreElements,
      date_generation: record.dateGeneration.toISOString(),
      date_expiration: record.dateExpiration?.toISOString() ?? null,
      organisation_id: record.organisationId ?? null,
      ecole_id: record.ecoleId ?? null,
    };
  }

  public static depuisRow(row: AuditExportRow): AuditExportRecord {
    return {
      idAuditExport: row.id_audit_export,
      idAuditEntry: row.audit_entry_id,
      acteurId: row.acteur_id ?? undefined,
      formatExport: row.format_export,
      nombreElements: row.nombre_elements,
      dateGeneration: new Date(row.date_generation),
      dateExpiration: row.date_expiration ? new Date(row.date_expiration) : undefined,
      organisationId: row.organisation_id ?? undefined,
      ecoleId: row.ecole_id ?? undefined,
    };
  }

  public static versOutput(row: AuditExportRow): AuditExportOutput {
    return {
      exportId: row.id_audit_export,
      format: row.format_export,
      nombreElements: row.nombre_elements,
      dateGeneration: row.date_generation,
    };
  }

  public static versReadModel(row: AuditExportRow, action = 'EXPORT'): AuditExportItemReadModel {
    return {
      idAuditEntry: row.audit_entry_id,
      action,
      resultat: 'SUCCES',
    };
  }

  public static versJsonExport(lignes: readonly Record<string, unknown>[]): unknown {
    return AuditJsonbMapper.serialiser(lignes);
  }

  public static versCsvRows(lignes: readonly Record<string, unknown>[]): string[] {
    if (lignes.length === 0) {
      return [];
    }
    const colonnes = Object.keys(lignes[0]);
    const header = colonnes.join(',');
    const rows = lignes.map((ligne) =>
      colonnes.map((colonne) => JSON.stringify(ligne[colonne] ?? '')).join(','));
    return [header, ...rows];
  }
}
