import type { AuditArchiveRepository, AuditEntryRepository } from '../../../../domain/repositories';
import { PostgresAuditColdStorageForensicCatalog } from './forensic/PostgresAuditColdStorageForensicCatalog';
import { PostgresAuditColdStorageMonitoringService } from './monitoring/PostgresAuditColdStorageMonitoringService';
import { PostgresAuditColdStorageReader } from './readers/PostgresAuditColdStorageReader';
import { PostgresAuditColdStorageRestorationService } from './restoration/PostgresAuditColdStorageRestorationService';
import { PostgresAuditColdStorageWriter } from './writers/PostgresAuditColdStorageWriter';

// Cette facade expose les capacites V1 de stockage froid sans simuler encore un fournisseur cloud reel.
export class PostgresAuditColdStorageFacade {
  public readonly reader: PostgresAuditColdStorageReader;
  public readonly writer: PostgresAuditColdStorageWriter;
  public readonly forensic: PostgresAuditColdStorageForensicCatalog;
  public readonly restoration: PostgresAuditColdStorageRestorationService;
  public readonly monitoring: PostgresAuditColdStorageMonitoringService;

  constructor(
    archiveRepository: AuditArchiveRepository,
    auditEntryRepository: AuditEntryRepository,
  ) {
    this.reader = new PostgresAuditColdStorageReader();
    this.writer = new PostgresAuditColdStorageWriter(archiveRepository, auditEntryRepository);
    this.forensic = new PostgresAuditColdStorageForensicCatalog(this.reader);
    this.restoration = new PostgresAuditColdStorageRestorationService(this.reader, archiveRepository, auditEntryRepository);
    this.monitoring = new PostgresAuditColdStorageMonitoringService();
  }
}

