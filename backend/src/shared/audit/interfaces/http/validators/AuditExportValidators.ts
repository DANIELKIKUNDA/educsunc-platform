import type { AuditExportQuery } from 'shared/audit/application';
import { ValidationHttpAudit } from './ValidationHttpAudit';

const FORMATS = ['PDF', 'CSV', 'JSON'] as const;

export class AuditExportRequestValidator {
  public static valider(corps: unknown): AuditExportQuery {
    const donnees = ValidationHttpAudit.obtenirObjet(corps, 'body');
    const format = ValidationHttpAudit.lireEnumOptionnel(donnees, 'format', FORMATS);
    if (!format) {
      throw new Error('format est requis.');
    }
    const filtres = ValidationHttpAudit.lireRecordOptionnel(donnees, 'filtres');
    return {
      format,
      filtres,
    };
  }
}

export class AuditExportStatusValidator {
  public static valider(params: unknown): { exportId: string } {
    const path = ValidationHttpAudit.obtenirObjet(params ?? {}, 'params');
    return {
      exportId: ValidationHttpAudit.lireChaineRequise(path, 'id'),
    };
  }
}

export class AuditExportDownloadValidator {
  public static valider(params: unknown): { exportId: string } {
    return AuditExportStatusValidator.valider(params);
  }
}

export class AuditExportDeleteValidator {
  public static valider(params: unknown): { exportId: string } {
    return AuditExportStatusValidator.valider(params);
  }
}
