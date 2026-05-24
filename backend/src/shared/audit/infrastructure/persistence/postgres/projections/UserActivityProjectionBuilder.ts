import type { AuditEntry } from '../../../../domain/aggregates';
import type { ActorTimelineReadModel } from '../../../../application/read-models/timeline/ActorTimelineReadModel';
import { AUDIT_PROJECTION_FAMILIES } from './AuditProjectionFamilies';
import { enrichirProjection, obtenirVueProjection, type AuditProjectionEnvelope } from './projection-helpers';

export class UserActivityProjectionBuilder {
  public construire(entree: AuditEntry): AuditProjectionEnvelope<ActorTimelineReadModel> | null {
    const vue = obtenirVueProjection(entree);
    if (!vue.acteurId) {
      return null;
    }

    return enrichirProjection(entree, AUDIT_PROJECTION_FAMILIES.USER_ACTIVITY, {
      acteurId: vue.acteurId,
      items: [
        {
          idAuditEntry: vue.idAuditEntry,
          action: vue.actionAudit,
          dateAction: vue.dateAction.toISOString(),
          resultat: vue.resultatAudit,
        },
      ],
    });
  }
}

