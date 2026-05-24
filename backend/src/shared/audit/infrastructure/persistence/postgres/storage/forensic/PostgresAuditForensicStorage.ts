import type { AuditForensicRepository } from '../../../../../domain/repositories';
import { PostgresAuditColdStorageForensicCatalog } from '../../cold-storage';
import type { AuditForensicStorageDescriptor } from '../StorageAuditTypes';

// Ce stockage forensic unifie les indices actifs et froids pour les investigations longues.
export class PostgresAuditForensicStorage {
  constructor(
    private readonly forensicRepository: AuditForensicRepository,
    private readonly coldStorageForensicCatalog: PostgresAuditColdStorageForensicCatalog,
  ) {}

  public async decrireWorkflow(correlationId: string): Promise<AuditForensicStorageDescriptor> {
    const [tracesActives, indicesFroids] = await Promise.all([
      this.forensicRepository.suivreWorkflow(correlationId),
      this.coldStorageForensicCatalog.listerIndices({}),
    ]);

    const froid = indicesFroids.filter((ligne) => ligne.correlationIds.includes(correlationId));
    return {
      storageId: `forensic-${correlationId}`,
      zone: froid.length > 0 ? 'COLD_STORAGE' : 'ACTIVE',
      type: 'FORENSIC_WORKFLOW',
      uri: froid[0]?.packageId ? `audit-cold://${froid[0].packageId}` : `audit-active://workflow/${correlationId}`,
      creeLe: new Date().toISOString(),
      tenantAware: true,
      forensicAware: true,
      correlations: [correlationId],
      requestIds: [
        ...new Set([
          ...tracesActives.map((trace) => trace.requestId).filter((value): value is string => typeof value === 'string'),
          ...froid.flatMap((ligne) => ligne.requestIds),
        ]),
      ],
      deviceIds: [
        ...new Set([
          ...tracesActives.map((trace) => trace.deviceId).filter((value): value is string => typeof value === 'string'),
          ...froid.flatMap((ligne) => ligne.deviceIds),
        ]),
      ],
    };
  }
}

