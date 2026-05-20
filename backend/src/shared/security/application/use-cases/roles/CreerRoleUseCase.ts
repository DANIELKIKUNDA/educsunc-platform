import type { UseCase } from 'shared/application/UseCase';
import type { CreerRoleInput } from '../../dto/input';
import type { RoleOutput } from '../../dto/output';
import { SecurityRoleService } from '../../services/SecurityRoleService';

export class CreerRoleUseCase implements UseCase<CreerRoleInput, RoleOutput> {
  constructor(private readonly securityRoleService: SecurityRoleService) {}
  public async executer(entree: CreerRoleInput): Promise<RoleOutput> {
    return this.securityRoleService.creerRole(entree);
  }
}
