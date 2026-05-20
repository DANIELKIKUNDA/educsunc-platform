import type { UseCase } from 'shared/application/UseCase';
import type { RetirerPermissionRoleInput } from '../../dto/input';
import type { RolePermissionsOutput } from '../../dto/output';
import { SecurityRoleService } from '../../services/SecurityRoleService';

export class RetirerPermissionRoleUseCase implements UseCase<RetirerPermissionRoleInput, RolePermissionsOutput> {
  constructor(private readonly securityRoleService: SecurityRoleService) {}
  public async executer(entree: RetirerPermissionRoleInput): Promise<RolePermissionsOutput> {
    return this.securityRoleService.retirerPermission(entree);
  }
}
