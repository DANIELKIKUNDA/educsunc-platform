import type {
  AuditArchiveRepository,
  AuditEntryRepository,
  AuditExportRepository,
  AuditForensicRepository,
  AuditRetentionRepository,
} from '../../../../domain/repositories';
import { PostgresAuditArchivalFacade } from '../archival';
import { PostgresAuditColdStorageFacade } from '../cold-storage';
import { PostgresAuditArchiveStorage } from './archives/PostgresAuditArchiveStorage';
import { PostgresAuditExportStorage } from './exports/PostgresAuditExportStorage';
import { PostgresAuditForensicStorage } from './forensic/PostgresAuditForensicStorage';
import { PostgresAuditRecoveryStorage } from './recovery/PostgresAuditRecoveryStorage';

// Cette facade donne un point d acces unique aux zones de stockage Audit.
export class PostgresAuditStorageFacade {
  public readonly archives: PostgresAuditArchiveStorage;
  public readonly exports: PostgresAuditExportStorage;
  public readonly forensic: PostgresAuditForensicStorage;
  public readonly recovery: PostgresAuditRecoveryStorage;

  constructor(deps: {
    archiveRepository: AuditArchiveRepository;
    auditEntryRepository: AuditEntryRepository;
    exportRepository: AuditExportRepository;
    forensicRepository: AuditForensicRepository;
    retentionRepository: AuditRetentionRepository;
  }) {
    const coldStorage = new PostgresAuditColdStorageFacade(
      deps.archiveRepository,
      deps.auditEntryRepository,
    );
    const archival = new PostgresAuditArchivalFacade(
      deps.archiveRepository,
      deps.retentionRepository,
    );
    const exportStorage = new PostgresAuditExportStorage(deps.exportRepository);

    this.archives = new PostgresAuditArchiveStorage(deps.archiveRepository, coldStorage);
    this.exports = exportStorage;
    this.forensic = new PostgresAuditForensicStorage(deps.forensicRepository, coldStorage.forensic);
    this.recovery = new PostgresAuditRecoveryStorage(archival, coldStorage, exportStorage);
  }
}

