import type { UseCase } from 'shared/application/UseCase';
import type { RoleReadModel } from '../../read-models';
import type { ListerRolesQuery } from '../../queries';

export class ListerRolesUseCase implements UseCase<void, readonly RoleReadModel[]> {
  constructor(private readonly listerRolesQuery: ListerRolesQuery) {}
  public async executer(): Promise<readonly RoleReadModel[]> {
    return this.listerRolesQuery.executer();
  }
}
