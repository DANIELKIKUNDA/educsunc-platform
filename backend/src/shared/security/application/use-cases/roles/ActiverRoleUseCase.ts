import type { UseCase } from 'shared/application/UseCase';
import type { ActiverRoleInput } from '../../dto/input';
import type { RoleOutput } from '../../dto/output';
import { SecurityRoleService } from '../../services/SecurityRoleService';

export class ActiverRoleUseCase implements UseCase<ActiverRoleInput, RoleOutput> {
  constructor(private readonly securityRoleService: SecurityRoleService) {}
  public async executer(entree: ActiverRoleInput): Promise<RoleOutput> {
    return this.securityRoleService.activerRole(entree.codeRole);
  }
}
