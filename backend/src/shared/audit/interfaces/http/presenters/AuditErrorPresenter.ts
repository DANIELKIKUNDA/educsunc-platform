import type { AuditHttpErrorBody } from './HttpAuditPresenterTypes';

export class AuditErrorPresenter {
  public static presenterErreur(erreur: unknown): { statutHttp: number; corps: AuditHttpErrorBody } {
    const message = erreur instanceof Error ? erreur.message : 'Erreur Audit inconnue.';
    const code =
      message.toLowerCase().includes('requis') || message.toLowerCase().includes('doit')
        ? 'AUDIT_VALIDATION_ERROR'
        : 'AUDIT_HTTP_ERROR';

    return {
      statutHttp: code === 'AUDIT_VALIDATION_ERROR' ? 400 : 500,
      corps: {
        success: false,
        error: {
          code,
          message,
        },
      },
    };
  }
}
