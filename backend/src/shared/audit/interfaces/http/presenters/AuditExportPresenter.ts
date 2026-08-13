import type { AuditExportOutput } from 'shared/audit/application';
import type { AuditHttpSuccessBody } from './HttpAuditPresenterTypes';

export class AuditExportPresenter {
  public static presenter(sortie: AuditExportOutput): AuditHttpSuccessBody<unknown> {
    return {
      success: true,
      data: {
        exportId: sortie.exportId,
        format: sortie.format,
        nombreElements: sortie.nombreElements,
        dateGeneration: sortie.dateGeneration,
        statut: sortie.statut,
        urlTemporaire: sortie.urlTemporaire,
      },
    };
  }

  public static presenterStatut(exportId: string, statut: string, details: Record<string, unknown> = {}): AuditHttpSuccessBody<unknown> {
    return {
      success: true,
      data: {
        exportId,
        statut,
        nombreElements: details.nombreElements,
        erreur: details.erreur,
        expireLe: details.expireLe,
      },
    };
  }

  public static presenterTelechargement(exportId: string, telechargement: string): AuditHttpSuccessBody<unknown> {
    return {
      success: true,
      data: {
        exportId,
        telechargement,
      },
    };
  }
}
