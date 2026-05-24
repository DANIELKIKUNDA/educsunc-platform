import { obtenirAuditConfigurationMemoryStore } from '../AuditConfigurationMemoryStore';
import type { AuditConfigurationScope, AuditResolvedConfiguration } from '../ConfigurationTypes';
import { AuditTenantConfigurationService } from '../tenants/AuditTenantConfigurationService';

export class AuditConfigurationCache {
  public constructor(
    private readonly tenants: AuditTenantConfigurationService = new AuditTenantConfigurationService(),
  ) {}

  public lire(scope: AuditConfigurationScope): AuditResolvedConfiguration | undefined {
    return obtenirAuditConfigurationMemoryStore().cache.get(this.tenants.composerCle(scope));
  }

  public ecrire(scope: AuditConfigurationScope, configuration: AuditResolvedConfiguration): void {
    obtenirAuditConfigurationMemoryStore().cache.set(this.tenants.composerCle(scope), configuration);
  }

  public invalider(scope?: AuditConfigurationScope): void {
    const store = obtenirAuditConfigurationMemoryStore();
    if (!scope) {
      store.cache.clear();
      return;
    }

    const cible = this.tenants.composerCle(scope);
    for (const key of [...store.cache.keys()]) {
      if (this.estAffecte(cible, key)) {
        store.cache.delete(key);
      }
    }
  }

  private estAffecte(scopeSourceKey: string, candidateKey: string): boolean {
    if (scopeSourceKey === candidateKey) {
      return true;
    }

    const source = scopeSourceKey.split('|');
    const candidate = candidateKey.split('|');
    if (source[0] === 'GLOBAL') {
      return true;
    }
    if (source[0] === 'ENVIRONNEMENT') {
      return source[1] === candidate[1];
    }
    if (source[0] === 'ORGANISATION') {
      return source[2] !== '' && source[2] === candidate[2];
    }

    return false;
  }
}
