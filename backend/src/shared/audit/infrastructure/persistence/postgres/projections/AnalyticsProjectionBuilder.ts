import type { AuditEntry } from '../../../../domain/aggregates';
import type { AuditStatisticsReadModel } from '../../../../application/read-models/analytics/AuditStatisticsReadModel';
import { AUDIT_PROJECTION_FAMILIES } from './AuditProjectionFamilies';
import { enrichirProjection, obtenirVueProjection, type AuditProjectionEnvelope } from './projection-helpers';

export class AnalyticsProjectionBuilder {
  public construire(entree: AuditEntry): AuditProjectionEnvelope<AuditStatisticsReadModel> {
    const vue = obtenirVueProjection(entree);
    return enrichirProjection(entree, AUDIT_PROJECTION_FAMILIES.ANALYTICS, {
      valeurs: {
        total: 1,
        [`action:${vue.actionAudit}`]: 1,
        [`gravite:${vue.graviteAudit}`]: 1,
        [`type:${vue.typeAuditPrincipal}`]: 1,
        offline: vue.modeOffline ? 1 : 0,
        conflits: vue.enConflit ? 1 : 0,
      },
    });
  }
}

