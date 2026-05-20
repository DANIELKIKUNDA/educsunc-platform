import type { RoleReadModel } from '../read-models';
export interface ListerRolesQuery {
  executer(): Promise<readonly RoleReadModel[]>;
}
