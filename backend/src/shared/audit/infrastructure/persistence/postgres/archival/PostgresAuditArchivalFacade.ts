import type { AuditArchiveRepository, AuditRetentionRepository } from '../../../../domain/repositories';
import { PostgresAuditArchiveReader } from './readers/PostgresAuditArchiveReader';
import { PostgresAuditArchiveWriter } from './writers/PostgresAuditArchiveWriter';
import { PostgresAuditArchiveRestorationService } from './restoration/PostgresAuditArchiveRestorationService';
import { PostgresAuditArchiveExportService } from './exports/PostgresAuditArchiveExportService';
import { PostgresAuditArchiveRetentionBridge } from './retention/PostgresAuditArchiveRetentionBridge';
import { PostgresAuditArchiveStorageAdapter } from './PostgresAuditArchiveStorageAdapter';
import { PostgresAuditColdStoragePreparer } from './PostgresAuditColdStoragePreparer';

// Cette facade regroupe les capacites d archivage logique, lecture, restauration et preparation cold storage.
export class PostgresAuditArchivalFacade {
  public readonly reader: PostgresAuditArchiveReader;
  public readonly writer: PostgresAuditArchiveWriter;
  public readonly restoration: PostgresAuditArchiveRestorationService;
  public readonly exports: PostgresAuditArchiveExportService;
  public readonly retention: PostgresAuditArchiveRetentionBridge;
  public readonly coldStorage: PostgresAuditColdStoragePreparer;

  constructor(
    archiveRepository: AuditArchiveRepository,
    retentionRepository: AuditRetentionRepository,
  ) {
    const storage = new PostgresAuditArchiveStorageAdapter();
    this.reader = new PostgresAuditArchiveReader(archiveRepository);
    this.writer = new PostgresAuditArchiveWriter(archiveRepository);
    this.restoration = new PostgresAuditArchiveRestorationService(archiveRepository);
    this.exports = new PostgresAuditArchiveExportService(archiveRepository, storage);
    this.retention = new PostgresAuditArchiveRetentionBridge(archiveRepository, retentionRepository);
    this.coldStorage = new PostgresAuditColdStoragePreparer(archiveRepository);
  }
}

