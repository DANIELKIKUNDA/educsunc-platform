import type { AuditEntry } from '../../../../domain/aggregates';
import type { ForensicCorrelationReadModel } from '../../../../application/read-models/forensic/ForensicCorrelationReadModel';
import { AUDIT_PROJECTION_FAMILIES } from './AuditProjectionFamilies';
import { enrichirProjection, estProjectionForensic, obtenirVueProjection, type AuditProjectionEnvelope } from './projection-helpers';

export class ForensicProjectionBuilder {
  public construire(entree: AuditEntry): AuditProjectionEnvelope<ForensicCorrelationReadModel> | null {
    const vue = obtenirVueProjection(entree);
    if (!estProjectionForensic(vue)) {
      return null;
    }

    return enrichirProjection(entree, AUDIT_PROJECTION_FAMILIES.FORENSIC, {
      correlationId: vue.correlationId,
      actions: [vue.actionAudit],
    });
  }
}

