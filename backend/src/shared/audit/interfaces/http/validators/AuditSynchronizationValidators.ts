import type {
  CreateOfflineAuditEntryInput,
  OfflineAuditConflictInput,
  OfflineAuditReplayInput,
  OfflineAuditSyncStatusInput,
} from 'shared/audit/application';
import { ValidationHttpAudit } from './ValidationHttpAudit';

export class AuditSyncCreateValidator {
  public static valider(corps: unknown): CreateOfflineAuditEntryInput {
    const donnees = ValidationHttpAudit.obtenirObjet(corps, 'body');
    return {
      audit: ValidationHttpAudit.obtenirObjet(donnees.audit, 'audit'),
      dateLocaleAction: ValidationHttpAudit.lireDateIsoOptionnelle(donnees, 'dateLocaleAction'),
      dateSynchronisation: ValidationHttpAudit.lireDateIsoOptionnelle(donnees, 'dateSynchronisation'),
      appareil: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'appareil'),
      statutSynchronisation: ValidationHttpAudit.lireChaineRequise(donnees, 'statutSynchronisation'),
      replay: ValidationHttpAudit.lireBooleenOptionnel(donnees, 'replay'),
      retry: ValidationHttpAudit.lireBooleenOptionnel(donnees, 'retry'),
      conflit: ValidationHttpAudit.lireBooleenOptionnel(donnees, 'conflit'),
    };
  }
}

export class AuditSyncReplayValidator {
  public static valider(corps: unknown): OfflineAuditReplayInput {
    return {
      auditId: ValidationHttpAudit.lireChaineRequise(ValidationHttpAudit.obtenirObjet(corps, 'body'), 'auditId'),
      replayPar: ValidationHttpAudit.lireChaineOptionnelle(ValidationHttpAudit.obtenirObjet(corps, 'body'), 'replayPar'),
    };
  }
}

export class AuditSyncRecoveryValidator {
  public static valider(corps: unknown): OfflineAuditConflictInput {
    const donnees = ValidationHttpAudit.obtenirObjet(corps, 'body');
    return {
      auditId: ValidationHttpAudit.lireChaineRequise(donnees, 'auditId'),
      resolution: ValidationHttpAudit.lireChaineRequise(donnees, 'resolution'),
      justification: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'justification'),
    };
  }
}

export class AuditSyncStatusValidator {
  public static valider(corps: unknown): OfflineAuditSyncStatusInput {
    const donnees = ValidationHttpAudit.obtenirObjet(corps, 'body');
    return {
      auditId: ValidationHttpAudit.lireChaineRequise(donnees, 'auditId'),
      statutSynchronisation: ValidationHttpAudit.lireChaineRequise(donnees, 'statutSynchronisation'),
    };
  }
}
