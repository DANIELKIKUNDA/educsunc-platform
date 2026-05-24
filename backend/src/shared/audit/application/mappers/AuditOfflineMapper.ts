import type { CreateOfflineAuditEntryInput } from '../dto/inputs/CreateOfflineAuditEntryInput';
import type { AuditOfflineStatusOutput } from '../dto/outputs/AuditOfflineStatusOutput';

// Ce mapper applicatif convertit les contrats Audit sans embarquer la persistence.
export class AuditOfflineMapper {
  public static depuisOfflineInput(valeur: CreateOfflineAuditEntryInput): AuditOfflineStatusOutput {
    const synchronise = valeur.statutSynchronisation === 'SYNCED';
    const conflit = valeur.conflit === true || valeur.statutSynchronisation === 'CONFLICT';
    return {
      total: 1,
      synchronises: synchronise ? 1 : 0,
      enConflit: conflit ? 1 : 0,
      enAttente: synchronise || conflit ? 0 : 1,
      auditId: typeof valeur.audit?.idAuditEntry === 'string' ? valeur.audit.idAuditEntry : undefined,
      statutSynchronisation: valeur.statutSynchronisation,
      replay: valeur.replay,
      retry: valeur.retry,
      conflit,
      horodatage: valeur.dateSynchronisation ?? valeur.dateLocaleAction ?? new Date().toISOString(),
    };
  }

  public static versOfflineStatusOutput(valeur: AuditOfflineStatusOutput): AuditOfflineStatusOutput {
    return { ...valeur };
  }
}
