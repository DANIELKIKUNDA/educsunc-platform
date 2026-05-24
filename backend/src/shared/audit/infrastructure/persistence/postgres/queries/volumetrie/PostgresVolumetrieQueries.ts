import type {
  GetAuditArchiveStatusQuery,
} from '../../../../../application/queries/volumetrie';
import type { AuditAnalyticsQuery } from '../../../../../application/dto/queries/AuditAnalyticsQuery';
import type { AuditArchiveStatusReadModel } from '../../../../../application/read-models/consultation/AuditArchiveStatusReadModel';
import type { AuditPartitionStatisticsReadModel } from '../../../../../application/read-models/volumetrie/AuditPartitionStatisticsReadModel';
import type { AuditRetentionReadModel } from '../../../../../application/read-models/volumetrie/AuditRetentionReadModel';

export class PostgresVolumetrieQueries implements
  GetAuditArchiveStatusQuery {
  public constructor(private readonly deps: Pick<import('../query-helpers').AuditQueryDependencies, 'archiveRepository' | 'retentionRepository' | 'analyticsRepository'>) {}

  public async executer(filtres: AuditAnalyticsQuery): Promise<AuditArchiveStatusReadModel> {
    const archives = await this.deps.archiveRepository.rechercherArchives({
      organisationId: filtres.organisationId,
      ecoleId: filtres.ecoleId,
    });
    return {
      archiveId: archives[0]?.idArchive,
      statut: archives.length > 0 ? 'ARCHIVE_PRESENTE' : 'AUCUNE_ARCHIVE',
    };
  }

  public async executerPartition(_filtres: AuditAnalyticsQuery): Promise<AuditPartitionStatisticsReadModel> {
    const volumetrie = await this.deps.analyticsRepository.calculerVolumetrieTenant({});
    return {
      partition: new Date().toISOString().slice(0, 7),
      total: typeof volumetrie.totalAudits === 'number' ? volumetrie.totalAudits : 0,
    };
  }

  public async executerRetention(_filtres: AuditAnalyticsQuery): Promise<AuditRetentionReadModel> {
    const reference = new Date();
    const archivables = await this.deps.retentionRepository.listerArchivables(reference);
    const purgeables = await this.deps.retentionRepository.listerPurgeables(reference);
    return {
      totalArchivables: archivables.length,
      totalPurgeables: purgeables.length,
    };
  }
}
