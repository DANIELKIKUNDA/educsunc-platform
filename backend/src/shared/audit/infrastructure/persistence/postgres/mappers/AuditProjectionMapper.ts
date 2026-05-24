import type {
  AuditProjectionRecord,
} from '../../../../domain/repositories';
import type { AuditProjectionTimelineRow } from './AuditPersistenceRecords';
import type { TimelineEventReadModel } from '../../../../application/read-models/timeline/TimelineEventReadModel';

// Ce mapper garde les projections dans un format leger et distinct de la source de verite.
export class AuditProjectionMapper {
  public static versTimelineRow(projection: AuditProjectionRecord): AuditProjectionTimelineRow {
    return {
      id: Number.parseInt(projection.idProjection.replace(/\D/g, '').slice(-9) || '0', 10),
      audit_entry_id: projection.idAuditEntry,
      acteur_id: projection.acteurId ?? null,
      id_ressource: projection.idRessource ?? null,
      action: projection.actionAudit ?? 'AUDIT',
      gravite: projection.graviteAudit ?? 'INFO',
      resultat: projection.resultatAudit ?? 'SUCCES',
      correlation_id: projection.correlationId ?? null,
      organisation_id: projection.organisationId ?? null,
      ecole_id: projection.ecoleId ?? null,
      scope: projection.scope ?? 'PLATEFORME',
      date_action: projection.dateAction.toISOString(),
    };
  }

  public static depuisTimelineRow(row: AuditProjectionTimelineRow): AuditProjectionRecord {
    return {
      idProjection: `projection-${row.id}`,
      idAuditEntry: row.audit_entry_id,
      typeProjection: 'TIMELINE',
      scope: row.scope,
      actionAudit: row.action,
      graviteAudit: row.gravite,
      resultatAudit: row.resultat,
      dateAction: new Date(row.date_action),
      organisationId: row.organisation_id ?? undefined,
      ecoleId: row.ecole_id ?? undefined,
      correlationId: row.correlation_id ?? undefined,
      acteurId: row.acteur_id ?? undefined,
      idRessource: row.id_ressource ?? undefined,
      donnees: {},
    };
  }

  public static versTimelineReadModel(row: AuditProjectionTimelineRow, action = 'AUDIT'): TimelineEventReadModel {
    return {
      idAuditEntry: row.audit_entry_id,
      action: row.action || action,
      dateAction: row.date_action,
      resultat: row.resultat,
    };
  }
}
