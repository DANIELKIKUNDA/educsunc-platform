import type { ListerPermissionsRoleQuery, PermissionReadModel } from '../../../../application';
import { obtenirMemoireSecurityStore } from '../repositories/_memoireSecurityStore';

// Cette query retourne les permissions techniques rattachees a un role.
export class ListerPermissionsRoleSQL implements ListerPermissionsRoleQuery {
  public async executer(codeRole: string): Promise<readonly PermissionReadModel[]> {
    const store = obtenirMemoireSecurityStore();
    const idRole = store.rolesParCode.get(codeRole);
    if (!idRole) {
      return [];
    }
    const role = store.roles.get(idRole);
    return role ? role.permissions.map((permission) => ({ permission: permission.permission })) : [];
  }
}
