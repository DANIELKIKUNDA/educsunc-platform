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
        urlTemporaire: sortie.urlTemporaire,
      },
    };
  }

  public static presenterStatut(exportId: string, statut: string): AuditHttpSuccessBody<unknown> {
    return {
      success: true,
      data: {
        exportId,
        statut,
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
