import type { AuditEntry } from '../../../../domain/aggregates';
import type { AuditExportReadModel } from '../../../../application/read-models/exports/AuditExportReadModel';
import { AUDIT_PROJECTION_FAMILIES } from './AuditProjectionFamilies';
import { enrichirProjection, estProjectionExport, obtenirVueProjection, type AuditProjectionEnvelope } from './projection-helpers';

export class ExportProjectionBuilder {
  public construire(entree: AuditEntry): AuditProjectionEnvelope<AuditExportReadModel> | null {
    const vue = obtenirVueProjection(entree);
    if (!estProjectionExport(vue)) {
      return null;
    }

    return enrichirProjection(entree, AUDIT_PROJECTION_FAMILIES.EXPORTS, {
      exportId: vue.idAuditEntry,
      format: vue.actionAudit.includes('CSV') ? 'CSV' : 'JSON',
      nombreElements: 1,
      dateGeneration: vue.dateAction.toISOString(),
      items: [
        {
          idAuditEntry: vue.idAuditEntry,
          action: vue.actionAudit,
          resultat: vue.resultatAudit,
        },
      ],
    });
  }
}

