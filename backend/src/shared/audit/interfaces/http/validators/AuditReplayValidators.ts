import type { OfflineAuditReplayInput } from 'shared/audit/application';
import { ValidationHttpAudit } from './ValidationHttpAudit';

export class AuditReplayOfflineValidator {
  public static valider(corps: unknown): OfflineAuditReplayInput {
    const donnees = ValidationHttpAudit.obtenirObjet(corps, 'body');
    return {
      auditId: ValidationHttpAudit.lireChaineRequise(donnees, 'auditId'),
      replayPar: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'replayPar'),
    };
  }
}

export class AuditReplayBatchValidator {
  public static valider(corps: unknown): Record<string, unknown> {
    const donnees = ValidationHttpAudit.obtenirObjet(corps ?? {}, 'body');
    return {
      replayId: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'replayId'),
      raison: ValidationHttpAudit.lireChaineRequise(donnees, 'raison'),
      mode: ValidationHttpAudit.lireEnumOptionnel(donnees, 'mode', ['DRY_RUN', 'EXECUTE'] as const) ?? 'DRY_RUN',
      limite: ValidationHttpAudit.lireEntierDansBornes(donnees, 'limite', 1, 1_000),
      profondeur: ValidationHttpAudit.lireEntierDansBornes(donnees, 'profondeur', 1, 100_000),
      correlationId: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'correlationId'),
    };
  }
}
