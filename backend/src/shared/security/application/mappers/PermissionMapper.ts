import type { RolePermissionsOutput } from '../dto/output';
import type { Role } from '../../../security/domain';
export class PermissionMapper {
  public static depuisRole(role: Role): RolePermissionsOutput {
    return {
      codeRole: role.obtenirCodeRole().obtenirValeur(),
      permissions: role.obtenirPermissions().map((permissionRole) => permissionRole.obtenirPermission().obtenirValeur()),
    };
  }
}
