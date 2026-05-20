import type { RoleReadModel } from '../read-models';
export interface ObtenirRoleParCodeQuery {
  executer(codeRole: string): Promise<RoleReadModel | null>;
}
