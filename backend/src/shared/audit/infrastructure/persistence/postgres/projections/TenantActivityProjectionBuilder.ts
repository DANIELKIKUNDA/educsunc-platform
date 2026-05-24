import type { AuditEntry } from '../../../../domain/aggregates';
import type { AuditStatisticsReadModel } from '../../../../application/read-models/analytics/AuditStatisticsReadModel';
import { AUDIT_PROJECTION_FAMILIES } from './AuditProjectionFamilies';
import { enrichirProjection, obtenirVueProjection, type AuditProjectionEnvelope } from './projection-helpers';

export class TenantActivityProjectionBuilder {
  public construire(entree: AuditEntry): AuditProjectionEnvelope<AuditStatisticsReadModel> | null {
    const vue = obtenirVueProjection(entree);
    if (!vue.organisationId && !vue.ecoleId) {
      return null;
    }

    return enrichirProjection(entree, AUDIT_PROJECTION_FAMILIES.TENANT_ACTIVITY, {
      valeurs: {
        total: 1,
        organisation: vue.organisationId ? 1 : 0,
        ecole: vue.ecoleId ? 1 : 0,
        [`scope:${vue.scope}`]: 1,
      },
    });
  }
}

