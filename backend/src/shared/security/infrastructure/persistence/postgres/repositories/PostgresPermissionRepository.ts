import type { PermissionRepositoryPort } from '../../../../application';
import { obtenirMemoireSecurityStore } from './_memoireSecurityStore';

// Ce depot fournit la lecture des permissions attachees aux roles.
export class PostgresPermissionRepository implements PermissionRepositoryPort {
  public async listerPermissionsRole(codeRole: string): Promise<readonly string[]> {
    const store = obtenirMemoireSecurityStore();
    const idRole = store.rolesParCode.get(codeRole);
    if (!idRole) {
      return [];
    }
    const role = store.roles.get(idRole);
    return role ? role.permissions.map((permission) => permission.permission) : [];
  }
}
