import type { AuditArchiveRepository } from '../../../../../domain/repositories';
import { PostgresAuditColdStorageFacade } from '../../cold-storage';
import type {
  AuditArchiveStorageDescriptor,
  AuditColdStorageDescriptor,
} from '../StorageAuditTypes';

// Ce stockage archives fait le pont entre archives logiques et paquets froids.
export class PostgresAuditArchiveStorage {
  constructor(
    private readonly archiveRepository: AuditArchiveRepository,
    private readonly coldStorageFacade: PostgresAuditColdStorageFacade,
  ) {}

  public async listerArchivesActives(filtres: { organisationId?: string; ecoleId?: string; typeArchive?: string }): Promise<AuditArchiveStorageDescriptor[]> {
    const archives = await this.archiveRepository.rechercherArchives(filtres);
    return archives.map((archive) => ({
      storageId: archive.idArchive,
      zone: 'ARCHIVE',
      type: archive.typeArchive,
      organisationId: archive.organisationId,
      ecoleId: archive.ecoleId,
      uri: `audit-archive://${archive.idArchive}`,
      creeLe: archive.dateArchivage.toISOString(),
      tenantAware: true,
      forensicAware: true,
      archive,
    }));
  }

  public async listerPackagesFroids(filtres: { organisationId?: string; ecoleId?: string; typeArchive?: string }): Promise<AuditColdStorageDescriptor[]> {
    const packages = await this.coldStorageFacade.reader.rechercher(filtres);
    return packages.map((pkg) => ({
      storageId: pkg.packageId,
      zone: 'COLD_STORAGE',
      type: pkg.typeArchive,
      organisationId: pkg.organisationId,
      ecoleId: pkg.ecoleId,
      scope: pkg.scope,
      uri: `audit-cold://${pkg.packageId}`,
      creeLe: pkg.creeLe,
      tenantAware: true,
      forensicAware: true,
      packageColdStorage: pkg,
    }));
  }
}

