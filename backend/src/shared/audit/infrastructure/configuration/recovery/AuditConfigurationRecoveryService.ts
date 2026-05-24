import { AuditConfigurationCache } from '../caching/AuditConfigurationCache';
import type { AuditConfigurationChangeMetadata, AuditConfigurationSnapshot } from '../ConfigurationTypes';
import { AuditConfigurationVersioningService } from '../versioning/AuditConfigurationVersioningService';

export class AuditConfigurationRecoveryService {
  public constructor(
    private readonly versioning: AuditConfigurationVersioningService = new AuditConfigurationVersioningService(),
    private readonly cache: AuditConfigurationCache = new AuditConfigurationCache(),
  ) {}

  public restaurer(version: string, metadata: AuditConfigurationChangeMetadata): AuditConfigurationSnapshot {
    const original = this.versioning.obtenirVersion(version);
    const restored = this.versioning.enregistrer(original.scope, original.patch, {
      ...metadata,
      rollbackVersion: version,
      raison: metadata.raison ?? `ROLLBACK:${version}`,
    });
    this.cache.invalider(original.scope);
    return restored;
  }

  public obtenirScopeDepuisVersion(version: string) {
    return this.versioning.obtenirVersion(version).scope;
  }
}
