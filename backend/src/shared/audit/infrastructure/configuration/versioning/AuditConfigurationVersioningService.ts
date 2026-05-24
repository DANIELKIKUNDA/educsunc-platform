import { createHash } from 'node:crypto';
import { obtenirAuditConfigurationMemoryStore } from '../AuditConfigurationMemoryStore';
import type {
  AuditConfigurationChangeMetadata,
  AuditConfigurationDiff,
  AuditConfigurationScope,
  AuditConfigurationSnapshot,
  AuditInfrastructureConfigurationPatch,
} from '../ConfigurationTypes';
import { AuditTenantConfigurationService } from '../tenants/AuditTenantConfigurationService';

export class AuditConfigurationVersioningService {
  public constructor(
    private readonly tenants: AuditTenantConfigurationService = new AuditTenantConfigurationService(),
  ) {}

  public enregistrer(
    scope: AuditConfigurationScope,
    patch: AuditInfrastructureConfigurationPatch,
    metadata: AuditConfigurationChangeMetadata,
  ): AuditConfigurationSnapshot {
    const store = obtenirAuditConfigurationMemoryStore();
    const key = this.tenants.composerCle(scope);
    const previous = store.current.get(key);
    const version = `${key}@${store.history.length + 1}`;
    const snapshot: AuditConfigurationSnapshot = {
      version,
      previousVersion: previous?.version,
      scope,
      patch,
      fingerprint: createHash('sha256').update(JSON.stringify({ scope, patch })).digest('hex'),
      changedAt: new Date().toISOString(),
      changedBy: metadata.auteur,
      reason: metadata.raison,
      correlationId: metadata.correlationId,
      requestId: metadata.requestId,
      sessionId: metadata.sessionId,
      deviceId: metadata.deviceId,
      organisationId: metadata.organisationId,
      ecoleId: metadata.ecoleId,
      replayId: metadata.replayId,
      retryCount: metadata.retryCount,
      syncId: metadata.syncId,
      rollbackVersion: metadata.rollbackVersion,
    };

    store.current.set(key, snapshot);
    store.history.push(snapshot);
    return snapshot;
  }

  public listerHistorique(scope?: AuditConfigurationScope): AuditConfigurationSnapshot[] {
    const store = obtenirAuditConfigurationMemoryStore();
    if (!scope) {
      return [...store.history];
    }

    const key = this.tenants.composerCle(scope);
    return store.history.filter((snapshot) => this.tenants.composerCle(snapshot.scope) === key);
  }

  public comparer(versionA: string, versionB: string): AuditConfigurationDiff {
    const store = obtenirAuditConfigurationMemoryStore();
    const a = store.history.find((snapshot) => snapshot.version === versionA);
    const b = store.history.find((snapshot) => snapshot.version === versionB);
    if (!a || !b) {
      throw new Error('Impossible de comparer des versions de configuration introuvables.');
    }

    const sections = new Set<string>();
    const patchA = a.patch as Record<string, unknown>;
    const patchB = b.patch as Record<string, unknown>;
    for (const section of Object.keys({ ...patchA, ...patchB })) {
      if (JSON.stringify(patchA[section]) !== JSON.stringify(patchB[section])) {
        sections.add(section);
      }
    }

    return {
      versionA,
      versionB,
      sections: [...sections],
    };
  }

  public obtenirVersion(version: string): AuditConfigurationSnapshot {
    const snapshot = obtenirAuditConfigurationMemoryStore().history.find((item) => item.version === version);
    if (!snapshot) {
      throw new Error(`Configuration version ${version} introuvable.`);
    }

    return snapshot;
  }
}
