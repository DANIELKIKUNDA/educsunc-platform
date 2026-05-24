import type {
  GetUnsynchronizedAuditsQuery,
} from '../../../../../application/queries/offline';
import type { AuditOfflineQuery } from '../../../../../application/dto/queries/AuditOfflineQuery';
import type { OfflineAuditReadModel } from '../../../../../application/read-models/offline/OfflineAuditReadModel';
import type { ReplayAuditReadModel } from '../../../../../application/read-models/offline/ReplayAuditReadModel';
import type { RetryAuditReadModel } from '../../../../../application/read-models/offline/RetryAuditReadModel';
import type { SynchronizationConflictReadModel } from '../../../../../application/read-models/offline/SynchronizationConflictReadModel';
import { AuditSyncConflictMapper } from '../../mappers/AuditSyncConflictMapper';

export class PostgresOfflineQueries implements
  GetUnsynchronizedAuditsQuery {
  public constructor(private readonly deps: Pick<import('../query-helpers').AuditQueryDependencies, 'offlineRepository'>) {}

  public async executer(_filtres: AuditOfflineQuery): Promise<OfflineAuditReadModel> {
    const ids = await this.deps.offlineRepository.listerEnAttenteSynchronisation();
    return {
      auditId: ids[0] ?? 'AUDIT-VIDE',
      statutSynchronisation: 'PENDING',
    };
  }

  public async executerReplay(_filtres: AuditOfflineQuery): Promise<ReplayAuditReadModel> {
    const ids = await this.deps.offlineRepository.listerReplays();
    return {
      auditId: ids[0] ?? 'AUDIT-VIDE',
      replay: ids.length > 0,
    };
  }

  public async executerRetry(_filtres: AuditOfflineQuery): Promise<RetryAuditReadModel> {
    const ids = await this.deps.offlineRepository.listerRetries();
    return {
      auditId: ids[0] ?? 'AUDIT-VIDE',
      tentative: ids.length > 0 ? 1 : 0,
    };
  }

  public async executerConflits(_filtres: AuditOfflineQuery): Promise<SynchronizationConflictReadModel> {
    const conflits = await this.deps.offlineRepository.listerConflits();
    return conflits.length > 0
      ? AuditSyncConflictMapper.versReadModel(AuditSyncConflictMapper.versRow(conflits[0]))
      : { auditId: 'AUDIT-VIDE', raison: 'Aucun conflit' };
  }
}
