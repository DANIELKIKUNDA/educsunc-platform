import { OfflineAuditConflictService } from '../../offline';
import type { AuditSynchronizationConflict, AuditSynchronizationMergeStrategy } from '../SynchronizationTypes';

// La sync ne doit jamais ecraser silencieusement un conflit.
export class SynchronizationConflictResolver {
  public constructor(
    private readonly conflicts: OfflineAuditConflictService = new OfflineAuditConflictService(),
  ) {}

  public async detecter(args: {
    idQueueItem: string;
    description?: string;
    organisationId?: string;
    ecoleId?: string;
    scope?: string;
    idAuditEntry?: string;
  }): Promise<AuditSynchronizationConflict> {
    const conflict = await this.conflicts.enregistrer({
      idQueueItem: args.idQueueItem,
      typeConflit: 'SYNCHRONISATION',
      description: args.description,
      organisationId: args.organisationId,
      ecoleId: args.ecoleId,
      scope: args.scope,
      idAuditEntry: args.idAuditEntry,
    });

    return {
      idConflit: conflict.idConflit,
      idQueueItem: conflict.idQueueItem,
      typeConflit: conflict.typeConflit,
      description: conflict.description,
      strategieMerge: 'CONFLIT',
    };
  }

  public choisirStrategie(conflict: AuditSynchronizationConflict): AuditSynchronizationMergeStrategy {
    return conflict.strategieMerge ?? 'CONFLIT';
  }
}
