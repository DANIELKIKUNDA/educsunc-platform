import type { OfflineAuditRetryInput } from 'shared/audit/application/dto/offline/OfflineAuditRetryInput';
import { ValidationHttpAudit } from './ValidationHttpAudit';

export class AuditRetryJobValidator {
  public static valider(params: unknown, corps: unknown): Record<string, unknown> {
    const path = ValidationHttpAudit.obtenirObjet(params ?? {}, 'params');
    const donnees = ValidationHttpAudit.obtenirObjet(corps ?? {}, 'body');
    return {
      jobId: ValidationHttpAudit.lireChaineRequise(path, 'id'),
      raison: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'raison'),
      retryCount: ValidationHttpAudit.lireEntierDansBornes(donnees, 'retryCount', 0, 100),
      retryLimit: ValidationHttpAudit.lireEntierDansBornes(donnees, 'retryLimit', 1, 100),
    };
  }
}

export class AuditRetryExportValidator {
  public static valider(params: unknown, corps: unknown): Record<string, unknown> {
    const path = ValidationHttpAudit.obtenirObjet(params ?? {}, 'params');
    const donnees = ValidationHttpAudit.obtenirObjet(corps ?? {}, 'body');
    return {
      exportId: ValidationHttpAudit.lireChaineRequise(path, 'id'),
      raison: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'raison'),
      retryCount: ValidationHttpAudit.lireEntierDansBornes(donnees, 'retryCount', 0, 100),
    };
  }
}

export class AuditRetrySyncValidator {
  public static valider(params: unknown, corps: unknown): OfflineAuditRetryInput {
    const path = ValidationHttpAudit.obtenirObjet(params ?? {}, 'params');
    const donnees = ValidationHttpAudit.obtenirObjet(corps ?? {}, 'body');
    return {
      auditId: ValidationHttpAudit.lireChaineRequise(path, 'id'),
      tentative: ValidationHttpAudit.lireEntierDansBornes(donnees, 'tentative', 1, 100, true) as number,
    };
  }
}
