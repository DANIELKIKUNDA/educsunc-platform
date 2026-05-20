import type { PermissionReadModel } from '../read-models';
export interface ListerPermissionsRoleQuery {
  executer(codeRole: string): Promise<readonly PermissionReadModel[]>;
}
