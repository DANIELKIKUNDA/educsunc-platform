import type { AuditEntry } from '../../../../domain/aggregates';
import type { SecurityAlertReadModel } from '../../../../application/read-models/supervision/SecurityAlertReadModel';
import { AUDIT_PROJECTION_FAMILIES } from './AuditProjectionFamilies';
import {
  calculerCodeSecurite,
  construireResumeProjection,
  enrichirProjection,
  estProjectionSecurite,
  obtenirVueProjection,
  type AuditProjectionEnvelope,
} from './projection-helpers';

export class SecurityProjectionBuilder {
  public construire(entree: AuditEntry): AuditProjectionEnvelope<SecurityAlertReadModel> | null {
    const vue = obtenirVueProjection(entree);
    if (!estProjectionSecurite(vue)) {
      return null;
    }

    return enrichirProjection(entree, AUDIT_PROJECTION_FAMILIES.SECURITY, {
      code: calculerCodeSecurite(vue),
      message: construireResumeProjection(vue),
      gravite: vue.graviteAudit,
      correlationId: vue.correlationId,
      organisationId: vue.organisationId,
      ecoleId: vue.ecoleId,
    });
  }
}

