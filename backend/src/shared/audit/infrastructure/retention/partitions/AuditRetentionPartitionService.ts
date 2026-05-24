import { auditRetentionPartitionStrategy } from './auditRetentionPartitionStrategy';

// Le partitionnement simplifie rotation, archivage et purge.
export class AuditRetentionPartitionService {
  public obtenirStrategie() {
    return auditRetentionPartitionStrategy;
  }
}
