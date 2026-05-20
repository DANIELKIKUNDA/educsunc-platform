import type { UseCase } from 'shared/application/UseCase';
import type { PermissionReadModel } from '../../read-models';
import type { ListerPermissionsRoleQuery } from '../../queries';

export class ListerPermissionsRoleUseCase implements UseCase<{ codeRole: string }, readonly PermissionReadModel[]> {
  constructor(private readonly listerPermissionsRoleQuery: ListerPermissionsRoleQuery) {}
  public async executer(entree: { codeRole: string }): Promise<readonly PermissionReadModel[]> {
    return this.listerPermissionsRoleQuery.executer(entree.codeRole);
  }
}
