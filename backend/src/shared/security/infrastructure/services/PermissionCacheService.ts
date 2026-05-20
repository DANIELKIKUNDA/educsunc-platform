import type { PermissionCachePort } from '../../application';
import { SecurityCacheKeys } from '../cache/SecurityCacheKeys';

// Ce service fournit un cache memoire simple des permissions calculees pour SECURITY.
export class PermissionCacheService implements PermissionCachePort {
  private readonly cache = new Map<string, readonly string[]>();

  public async memoriserPermissions(idUtilisateur: string, permissions: readonly string[]): Promise<void> {
    this.cache.set(SecurityCacheKeys.permissions(idUtilisateur), [...permissions]);
  }

  public async obtenirPermissions(idUtilisateur: string): Promise<readonly string[] | null> {
    return this.cache.get(SecurityCacheKeys.permissions(idUtilisateur)) ?? null;
  }

  public async invaliderPermissions(idUtilisateur: string): Promise<void> {
    this.cache.delete(SecurityCacheKeys.permissions(idUtilisateur));
  }
}
