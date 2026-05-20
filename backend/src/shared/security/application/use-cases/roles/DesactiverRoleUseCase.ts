import type { UseCase } from 'shared/application/UseCase';
import type { DesactiverRoleInput } from '../../dto/input';
import type { RoleOutput } from '../../dto/output';
import { SecurityRoleService } from '../../services/SecurityRoleService';

export class DesactiverRoleUseCase implements UseCase<DesactiverRoleInput, RoleOutput> {
  constructor(private readonly securityRoleService: SecurityRoleService) {}
  public async executer(entree: DesactiverRoleInput): Promise<RoleOutput> {
    return this.securityRoleService.desactiverRole(entree.codeRole);
  }
}
