import { AuditOfflineMetadata } from '../../../../domain/entities';
import { StatutSynchronisationAudit } from '../../../../domain/value-objects';
import type { AuditEntryRow } from './AuditPersistenceRecords';

// Ce mapper preserve la chronologie offline-first et les marqueurs replay/retry.
export class AuditOfflinePersistenceMapper {
  public static versColonnes(entree: {
    idAuditEntry: string;
    auditOfflineMetadata?: AuditOfflineMetadata;
    dateAction: Date;
    dateSynchronisation?: Date;
  }): Pick<AuditEntryRow, 'mode_offline' | 'statut_synchronisation' | 'retry_count' | 'est_replay' | 'est_retry' | 'date_synchronisation'> {
    return {
      mode_offline: Boolean(entree.auditOfflineMetadata),
      statut_synchronisation: entree.auditOfflineMetadata?.obtenirStatutSynchronisation().obtenirValeur() ?? null,
      retry_count: entree.auditOfflineMetadata?.estRetry() ? 1 : 0,
      est_replay: entree.auditOfflineMetadata?.estReplay() ?? false,
      est_retry: entree.auditOfflineMetadata?.estRetry() ?? false,
      date_synchronisation: (entree.auditOfflineMetadata?.obtenirDateSynchronisation() ?? entree.dateSynchronisation)?.toISOString() ?? null,
    };
  }

  public static depuisColonnes(row: Pick<
    AuditEntryRow,
    | 'id_audit_entry'
    | 'mode_offline'
    | 'statut_synchronisation'
    | 'retry_count'
    | 'est_replay'
    | 'est_retry'
    | 'date_action'
    | 'date_synchronisation'
  >): AuditOfflineMetadata | undefined {
    if (!row.mode_offline && !row.statut_synchronisation && !row.est_replay && !row.est_retry) {
      return undefined;
    }
    const statut = row.statut_synchronisation ?? (row.mode_offline ? 'PENDING' : 'SYNCED');
    return new AuditOfflineMetadata({
      idAuditOfflineMetadata: `${row.id_audit_entry}-offline`,
      statutSynchronisation: new StatutSynchronisationAudit(statut),
      dateLocaleAction: new Date(row.date_action),
      dateSynchronisation: row.date_synchronisation ? new Date(row.date_synchronisation) : undefined,
      synchronise: statut === 'SYNCED',
      replay: row.est_replay,
      retry: row.est_retry || row.retry_count > 0,
      conflit: statut === 'CONFLICT',
    });
  }
}
