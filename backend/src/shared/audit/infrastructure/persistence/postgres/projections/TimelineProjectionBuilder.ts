import type { AuditEntry } from '../../../../domain/aggregates';
import type { TimelineEventReadModel } from '../../../../application/read-models/timeline/TimelineEventReadModel';
import { AUDIT_PROJECTION_FAMILIES } from './AuditProjectionFamilies';
import { enrichirProjection, obtenirVueProjection, type AuditProjectionEnvelope } from './projection-helpers';

export class TimelineProjectionBuilder {
  public construire(entree: AuditEntry): AuditProjectionEnvelope<TimelineEventReadModel> {
    const vue = obtenirVueProjection(entree);
    return enrichirProjection(entree, AUDIT_PROJECTION_FAMILIES.TIMELINE, {
      idAuditEntry: vue.idAuditEntry,
      action: vue.actionAudit,
      dateAction: vue.dateAction.toISOString(),
      resultat: vue.resultatAudit,
    });
  }
}

