import type { AuditEntry } from '../../../../domain/aggregates';
import type { AbnormalActivityReadModel } from '../../../../application/read-models/supervision/AbnormalActivityReadModel';
import { AUDIT_PROJECTION_FAMILIES } from './AuditProjectionFamilies';
import {
  construireResumeProjection,
  enrichirProjection,
  estProjectionSupervision,
  obtenirVueProjection,
  type AuditProjectionEnvelope,
} from './projection-helpers';

export class SupervisionProjectionBuilder {
  public construire(entree: AuditEntry): AuditProjectionEnvelope<AbnormalActivityReadModel> | null {
    const vue = obtenirVueProjection(entree);
    if (!estProjectionSupervision(vue)) {
      return null;
    }

    return enrichirProjection(entree, AUDIT_PROJECTION_FAMILIES.SUPERVISION, {
      acteurId: vue.acteurId,
      resume: construireResumeProjection(vue),
    });
  }
}

