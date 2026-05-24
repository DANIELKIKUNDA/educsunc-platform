import { PostgresAuditOfflineRepository, PostgresAuditSyncConflictRepository } from '../../persistence/postgres/repositories';
import { obtenirOfflineAuditLocalStore } from '../storage/OfflineAuditLocalStore';
import type { OfflineAuditConflictRecord } from '../OfflineAuditTypes';

// Les conflits offline doivent etre detectes, historises, auditables et resolvables.
export class OfflineAuditConflictService {
  public constructor(
    private readonly offlineRepository: PostgresAuditOfflineRepository = new PostgresAuditOfflineRepository(),
    private readonly repository: PostgresAuditSyncConflictRepository = new PostgresAuditSyncConflictRepository(),
  ) {}

  public async enregistrer(args: {
    idQueueItem: string;
    typeConflit: string;
    description?: string;
    organisationId?: string;
    ecoleId?: string;
    scope?: string;
    idAuditEntry?: string;
  }): Promise<OfflineAuditConflictRecord> {
    const record: OfflineAuditConflictRecord = {
      idConflit: `offline-conflict-${Date.now()}`,
      idQueueItem: args.idQueueItem,
      typeConflit: args.typeConflit,
      description: args.description,
      detecteLe: new Date().toISOString(),
      organisationId: args.organisationId,
      ecoleId: args.ecoleId,
      scope: args.scope,
      resolu: false,
    };

    obtenirOfflineAuditLocalStore().conflicts.set(record.idConflit, record);
    if (args.idAuditEntry) {
      await this.offlineRepository.enregistrerConflitTechnique?.(
        args.idAuditEntry,
        args.typeConflit,
        args.description,
      );
      await this.repository.enregistrerConflit({
        idAuditConflict: record.idConflit,
        idAuditEntry: args.idAuditEntry,
        typeConflit: args.typeConflit,
        descriptionConflit: args.description,
        dateDetection: new Date(record.detecteLe),
        statutResolution: 'EN_ATTENTE',
      });
    }

    return record;
  }

  public lister(): OfflineAuditConflictRecord[] {
    return [...obtenirOfflineAuditLocalStore().conflicts.values()];
  }

  public resoudre(idConflit: string, resolution: string): OfflineAuditConflictRecord | null {
    const current = obtenirOfflineAuditLocalStore().conflicts.get(idConflit);
    if (!current) {
      return null;
    }

    const resolved: OfflineAuditConflictRecord = {
      ...current,
      resolu: true,
      resolution,
    };
    obtenirOfflineAuditLocalStore().conflicts.set(idConflit, resolved);
    return resolved;
  }
}
